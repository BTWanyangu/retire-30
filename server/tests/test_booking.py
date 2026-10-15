"""Run: cd server && pytest -q (no real Paylor payments)."""
import hashlib
import hmac
import json
import os
import tempfile
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

os.environ['BOOKING_DB_PATH'] = os.path.join(tempfile.mkdtemp(), 'test.sqlite3')
os.environ['PAYLOR_WEBHOOK_SECRET'] = 'test-webhook-secret'

from fastapi.testclient import TestClient  # noqa: E402
import main  # noqa: E402

client = TestClient(main.app)
travel_date = (datetime.now(ZoneInfo('Africa/Nairobi')).date() + timedelta(days=2)).isoformat()


def get_trip():
    response = client.post('/api/bookings/search', json={'from':'Mombasa', 'to':'Mumias', 'date':travel_date, 'passengers':1})
    assert response.status_code == 200, response.text
    return response.json()[0]


def reserve():
    trip = get_trip()
    seats_response = client.get('/api/trips/' + trip['id'] + '/seats')
    assert seats_response.status_code == 200, seats_response.text
    free = [seat['number'] for seat in seats_response.json()['seats'] if seat['available']]
    assert free
    seat = free[0]
    body = {'tripId': trip['id'], 'seats':[seat], 'boarding':'Mombasa CBD', 'dropping':'Mumias Town',
            'passengers':[{'name':'Test Passenger','idNumber':'AB1234','nationality':'Kenyan',
                           'age':25,'gender':'Female','email':'passenger@example.com','phone':'0712345678'}]}
    response = client.post('/api/bookings', json=body)
    assert response.status_code == 200, response.text
    return trip, seat, body, response.json()


def test_stable_inventory_and_hold_conflict():
    trip, seat, body, booking = reserve()
    r = client.post('/api/bookings', json=body)
    assert r.status_code == 409
    seats = client.get('/api/trips/' + trip['id'] + '/seats').json()['seats']
    assert not next(x for x in seats if x['number'] == seat)['available']
    assert seats == client.get('/api/trips/' + trip['id'] + '/seats').json()['seats']
    assert booking['amount'] == trip['fare']
    assert booking['phone'] == '254712345678'


def test_booking_token_is_required():
    _, _, _, booking = reserve()
    assert client.get(f"/api/bookings/{booking['reference']}?token=invalid").status_code == 404
    assert client.get(f"/api/bookings/{booking['reference']}?token={booking['token']}").json()['status'] == 'HELD'


def test_signed_webhook_and_deduplication():
    _, _, _, booking = reserve()
    payload = {'event':'payment.success','transaction':{
      'id':'remote-id', 'reference':booking['reference'], 'amount': booking['amount'],
      'status':'COMPLETED','mpesaReceipt':'RFL8S2K9P0'}}
    body = json.dumps(payload).encode()
    assert client.post('/api/webhooks/paylor', content=body, headers={'x-webhook-signature':'wrong'}).status_code == 401
    signature = hmac.new(b'test-webhook-secret', body, hashlib.sha256).hexdigest()
    result = client.post('/api/webhooks/paylor', content=body,headers={'x-webhook-signature':signature})
    assert result.status_code == 200
    status = client.get(f"/api/bookings/{booking['reference']}?token={booking['token']}").json()
    assert status['status'] == 'PAID'
    assert status['receipt'] == 'RFL8S2K9P0'
    assert client.post('/api/webhooks/paylor', content=body,headers={'x-webhook-signature':signature}).status_code == 200
    assert client.get(f"/api/bookings/{booking['reference']}?token={booking['token']}").json()['status'] == 'PAID'


def test_wrong_amount_cannot_confirm():
    _, _, _, booking = reserve()
    payload = {'event':'payment.success', 'transaction': {'id':'remote', 'reference':booking['reference'], 'amount':1, 'status':'COMPLETED'}}
    body = json.dumps(payload).encode()
    signature = hmac.new(b'test-webhook-secret',body,hashlib.sha256).hexdigest()
    assert client.post('/api/webhooks/paylor', content=body,headers={'x-webhook-signature':signature}).status_code == 200
    assert client.get(f"/api/bookings/{booking['reference']}?token={booking['token']}").json()['status'] == 'HELD'


def test_live_stk_disabled_for_demo_inventory():
    _, _, _, booking = reserve()
    r = client.post('/api/payments/stk',json={'reference':booking['reference'],'token':booking['token'], 'phone':'0712345678'})
    assert r.status_code == 503


def test_stk_payload_idempotency_and_webhook_confirmation(monkeypatch):
    import httpx
    trip, seat, body, booking = reserve()
    monkeypatch.setattr(main, 'LIVE_PAYMENTS_ENABLED', True)
    monkeypatch.setenv('PAYLOR_API_KEY', 'test-key')
    monkeypatch.setenv('PAYLOR_CHANNEL_ID', 'PAYL-CHANNEL')
    monkeypatch.setenv('PUBLIC_BASE_URL', 'https://booking.example.com')
    requests = []

    def handler(request):
        if request.method == 'POST':
            data = json.loads(request.content)
            assert request.headers['authorization'] == 'Bearer test-key'
            assert request.headers['idempotency-key'] == booking['reference'] + '-attempt-1'
            assert data['amount'] == booking['amount']
            assert data['phone'] == '254712345678'
            assert data['channelId'] == 'PAYL-CHANNEL'
            assert data['callbackUrl'] == 'https://booking.example.com/api/webhooks/paylor'
            requests.append(request)
            return httpx.Response(200, json={'transactionId': 'remote-stk-1', 'status': 'SENT'})
        assert request.method == 'GET'
        return httpx.Response(200, json={'id':'remote-stk-1','reference':booking['reference'],
                                        'amount':booking['amount'],'status':'PENDING'})

    transport = httpx.MockTransport(handler)
    client_cls = httpx.AsyncClient
    monkeypatch.setattr(main.httpx, 'AsyncClient', lambda *args, **kwargs: client_cls(*args, transport=transport, **kwargs))
    body = {'reference':booking['reference'], 'token':booking['token'], 'phone':'0712345678'}
    assert client.post('/api/payments/stk', json=body).json()['status'] == 'PENDING'
    assert client.post('/api/payments/stk', json=body).json()['status'] == 'PENDING'
    assert len(requests) == 1  # No duplicate charge for same booking.
    payload = {'event':'payment.success', 'transaction': {
        'id':'remote-stk-1','reference':booking['reference'], 'amount':booking['amount'],
        'status':'COMPLETED', 'mpesaReceipt':'TESTRECEIPT'}}
    raw = json.dumps(payload).encode()
    signature = hmac.new(b'test-webhook-secret', raw, hashlib.sha256).hexdigest()
    assert client.post('/api/webhooks/paylor', content=raw, headers={'X-Webhook-Signature':signature}).status_code == 200
    result = client.get(f"/api/bookings/{booking['reference']}?token={booking['token']}").json()
    assert result['status'] == 'PAID' and result['receipt'] == 'TESTRECEIPT'


def test_late_paid_webhook_requires_manual_review():
    _, _, _, booking = reserve()
    with main.contextmanager_db() as db:
        db.execute('UPDATE bookings SET expires_at=? WHERE reference=?', (main.now() - 5, booking['reference']))
    payload = {'event': 'payment.success', 'transaction': {
      'id': 'late-stk-id', 'reference': booking['reference'], 'amount': booking['amount'],
      'status': 'COMPLETED', 'mpesaReceipt': 'LATE123'}}
    raw = json.dumps(payload).encode()
    signature = hmac.new(b'test-webhook-secret', raw, hashlib.sha256).hexdigest()
    assert client.post('/api/webhooks/paylor', content=raw, headers={'X-Webhook-Signature': signature}).status_code == 200
    status = client.get(f"/api/bookings/{booking['reference']}?token={booking['token']}").json()['status']
    assert status == 'PAYMENT_REVIEW'
