"""ENA Coach booking API. The published trip schedules are demonstration inventory until
an actual operator scheduling feed is connected. Bookings/payment statuses are real state.
"""
import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
import time
from contextlib import contextmanager
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv(Path(__file__).resolve().parent.parent / '.env')
LOCAL_TZ = ZoneInfo('Africa/Nairobi')
DB_PATH = os.getenv('BOOKING_DB_PATH', str(Path(__file__).resolve().parent / 'bookings.sqlite3'))
PAYLOR_BASE = os.getenv('PAYLOR_BASE_URL', 'https://api.paylorke.com/api/v1').rstrip('/')
LIVE_PAYMENTS_ENABLED = os.getenv('LIVE_PAYMENTS_ENABLED', 'false').lower() == 'true'
HOLD_SECONDS = int(os.getenv('BOOKING_HOLD_MINUTES', '15')) * 60
app = FastAPI(title='ENA Coach booking and payment service', version='1.0')
origins = [x.strip() for x in os.getenv('FRONTEND_ORIGINS', 'http://localhost:5173').split(',') if x.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=['GET', 'POST'], allow_headers=['Content-Type'])

TOWNS = [x.strip() for x in '''Awendo,Birongo,Bomet,Bondo,Bumala,Busia,Homa Bay,Katito,Kebirigo,Kehancha,Kendu Bay,Kericho,Keroka,Keumbu,Mbita,Kisii,Kisumu,Maseno,Migori,Mombasa,Mumias,Nairobi,Nakuru,Narok,Ndhiwa,Nyachege,Nyamira,Oyugis,Rodi Kopany,Rongo,Siaya,Sirare,Sondu,Sori,Sotik,Tabaka,Voi'''.split(',')]
TRIP_TIMES = [('01:00 PM', '06:00 AM', '17h 00m', 'MARCOPOLO II'), ('02:30 PM', '06:00 AM', '15h 30m', 'POLO G2')]
TERMINALS = {"Mombasa": ['Mombasa CBD', 'Mwembe Tayari', 'Changamwe'], 'Nairobi': ['Nairobi CBD', 'Muthurwa', 'Westlands'], 'Mumias': ['Mumias Town', 'Mumias Bus Park']}
PAID_STATUSES = {'COMPLETED', 'SUCCESS', 'SUCCESSFUL'}
FAILED_STATUSES = {'FAILED', 'CANCELLED', 'CANCELED', 'REJECTED'}


def connection():
    db = sqlite3.connect(DB_PATH, timeout=20, isolation_level=None)
    db.row_factory = sqlite3.Row
    db.execute('PRAGMA busy_timeout=20000')
    db.execute('PRAGMA journal_mode=WAL')
    return db


def init_db():
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    with contextmanager_db() as db:
        db.execute('''CREATE TABLE IF NOT EXISTS bookings (
          reference TEXT PRIMARY KEY, access_token TEXT NOT NULL, trip_id TEXT NOT NULL,
          seats TEXT NOT NULL, boarding TEXT NOT NULL, dropping TEXT NOT NULL,
          passengers TEXT NOT NULL, phone TEXT NOT NULL, amount INTEGER NOT NULL,
          created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
          status TEXT NOT NULL, provider_transaction_id TEXT, receipt TEXT,
          attempted_at INTEGER, attempt_number INTEGER NOT NULL DEFAULT 0)''')
        db.execute('CREATE INDEX IF NOT EXISTS idx_bookings_trip ON bookings(trip_id, status, expires_at)')

@contextmanager
def contextmanager_db():
    db = connection()
    try:
        yield db
    finally:
        db.close()

init_db()


def now():
    return int(time.time())


def err(message, code=400):
    raise HTTPException(status_code=code, detail=message)


def phone_clean(phone: str):
    digits = re.sub(r'\D', '', str(phone))
    if digits.startswith('0') and len(digits) == 10:
        digits = '254' + digits[1:]
    elif digits.startswith('7') or digits.startswith('1'):
        if len(digits) == 9:
            digits = '254' + digits
    if not re.fullmatch(r'254[17]\d{8}', digits):
        err('Enter a valid Kenyan phone number (e.g. 0712345678).')
    return digits


def validate_trip(value):
    segments = value.split('|')
    if len(segments) != 4:
        err('Invalid trip identifier')
    raw_date, src, dst, slot = segments
    try:
        travel_date = date.fromisoformat(raw_date)
    except ValueError:
        err('Invalid travel date')
    if src not in TOWNS or dst not in TOWNS or src == dst or slot not in ('0', '1'):
        err('Invalid trip route')
    if travel_date < datetime.now(LOCAL_TZ).date():
        err('Travel date is in the past')
    return raw_date, src, dst, int(slot)


def trip_detail(trip_id):
    travel_date, src, dst, slot = validate_trip(trip_id)
    dep, arr, duration, coach = TRIP_TIMES[slot]
    fare = 2500 if 'Mombasa' in (src, dst) else 1800
    return {'id': trip_id, 'date': travel_date, 'from': src, 'to': dst, 'departureTime': dep,
            'arrivalTime': arr, 'duration': duration, 'coach': coach, 'fare': fare,
            'className': 'Business / Normal', 'amenities': ['Wi-Fi', 'USB charging', 'Air conditioning'], 'routeLabel': f'{src.upper()}-{dst.upper()}',
            'boardingPoints': TERMINALS.get(src, [f'{src} Town', f'{src} Bus Park']),
            'droppingPoints': TERMINALS.get(dst, [f'{dst} Town', f'{dst} Bus Park'])}


def demo_seat_inventory(trip_id):
    # Stable random-looking seats for a given date/route/coach. Repeated visits never reshuffle.
    digest = hashlib.sha256(trip_id.encode()).digest()
    import random
    shuffled = list(range(1, 50))
    random.Random(int.from_bytes(digest, 'big')).shuffle(shuffled)
    free = set(shuffled[:11 + digest[0] % 7])
    return free


def refresh_expired(db):
    db.execute('''UPDATE bookings SET status='EXPIRED'
         WHERE status IN ('HELD','INITIATING','PAYMENT_PENDING','FAILED') AND expires_at <= ?''', (now(),))


def occupied(db, trip_id):
    refresh_expired(db)
    rows = db.execute('''SELECT seats FROM bookings WHERE trip_id=? AND
            (status='PAID' OR (status IN ('HELD','INITIATING','PAYMENT_PENDING','FAILED') AND expires_at > ?))''', (trip_id, now())).fetchall()
    return {n for r in rows for n in json.loads(r['seats'])}


def seats_for_trip(db, trip_id):
    free = demo_seat_inventory(trip_id) - occupied(db, trip_id)
    return [{'number': n, 'category': ('VIP' if n <= 8 else 'Business' if n >= 37 else 'Normal'),
             'available': n in free} for n in range(1, 50)]


class SearchInput(BaseModel):
    from_: str = Field(alias='from')
    to: str
    date: str
    passengers: int = Field(default=1, ge=1, le=8)
    tripType: str = 'one-way'
    returnDate: str | None = None


class Passenger(BaseModel):
    name: str = Field(min_length=3, max_length=120)
    idNumber: str = Field(min_length=4, max_length=35)
    nationality: str = Field(default='Kenyan', min_length=2, max_length=60)
    age: int = Field(ge=1, le=120)
    gender: str
    email: str = Field(min_length=5, max_length=180)
    phone: str


class BookingInput(BaseModel):
    tripId: str
    seats: list[int] = Field(min_length=1, max_length=8)
    boarding: str
    dropping: str
    passengers: list[Passenger] = Field(min_length=1, max_length=8)


class PaymentInput(BaseModel):
    reference: str
    token: str
    phone: str | None = None


@app.get('/api/health')
def health():
    return {'ok': True}


@app.get('/api/config')
def public_config():
    return {'paybill': os.getenv('MANUAL_PAYBILL_NUMBER', ''), 'account': os.getenv('MANUAL_ACCOUNT_NUMBER', ''),
            'manualEnabled': bool(LIVE_PAYMENTS_ENABLED and os.getenv('MANUAL_PAYBILL_NUMBER') and os.getenv('MANUAL_ACCOUNT_NUMBER')),
            'supportWhatsApp': re.sub(r'\D', '', os.getenv('SUPPORT_WHATSAPP', '')),
            'supportEmail': os.getenv('SUPPORT_EMAIL', 'info@enacoach.co.ke'), 'holdMinutes': HOLD_SECONDS // 60, 'demoInventory': not LIVE_PAYMENTS_ENABLED}


@app.post('/api/bookings/search')
def search_trips(body: SearchInput):
    if body.from_ not in TOWNS or body.to not in TOWNS or body.from_ == body.to:
        err('Choose two different towns from the list.')
    try:
        travel_date = date.fromisoformat(body.date)
    except ValueError:
        err('Invalid travel date.')
    if travel_date < datetime.now(LOCAL_TZ).date():
        err('Travel date cannot be in the past.')
    # Demo schedules only: replace with verified operator feed before selling real seats.
    result = []
    with contextmanager_db() as db:
        for slot in range(len(TRIP_TIMES)):
            trip = trip_detail(f'{body.date}|{body.from_}|{body.to}|{slot}')
            trip['seatsLeft'] = sum(1 for s in seats_for_trip(db, trip['id']) if s['available'])
            result.append(trip)
    return result


@app.get('/api/trips/{trip_id:path}/seats')
def get_seats(trip_id: str):
    trip = trip_detail(trip_id)
    with contextmanager_db() as db:
        seats = seats_for_trip(db, trip_id)
    return {'trip': trip, 'seats': seats, 'seatsLeft': sum(s['available'] for s in seats)}


@app.post('/api/bookings')
def reserve(body: BookingInput):
    trip = trip_detail(body.tripId)
    if len(body.seats) != len(body.passengers) or len(body.seats) != len(set(body.seats)):
        err('Provide one distinct seat and passenger per ticket.')
    if body.boarding not in trip['boardingPoints'] or body.dropping not in trip['droppingPoints']:
        err('Choose a valid boarding and dropping point.')
    if any(p.gender not in ('Male', 'Female', 'Other') or '@' not in p.email or not p.email.split('@')[-1].count('.') for p in body.passengers):
        err('Check the passenger details and email address.')
    phone = phone_clean(body.passengers[0].phone)
    reference = 'ENA-' + secrets.token_hex(6).upper()
    token = secrets.token_urlsafe(32)
    stamp = now()
    with contextmanager_db() as db:
        db.execute('BEGIN IMMEDIATE')
        try:
            free = {s['number'] for s in seats_for_trip(db, body.tripId) if s['available']}
            if not set(body.seats).issubset(free):
                err('One or more seats are no longer available. Please select different seats.', 409)
            amount = trip['fare'] * len(body.seats)
            db.execute('''INSERT INTO bookings (reference,access_token,trip_id,seats,boarding,dropping,passengers,phone,amount,created_at,expires_at,status)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?)''',
                (reference, token, body.tripId, json.dumps(body.seats), body.boarding, body.dropping,
                 json.dumps([p.model_dump() for p in body.passengers]), phone, amount, stamp, stamp + HOLD_SECONDS, 'HELD'))
            db.execute('COMMIT')
        except Exception:
            db.execute('ROLLBACK')
            raise
    return {'reference': reference, 'token': token, 'amount': amount, 'expiresAt': stamp + HOLD_SECONDS,
            'status': 'HELD', 'phone': phone}


def get_booking(db, reference, token):
    booking = db.execute('SELECT * FROM bookings WHERE reference=?', (reference,)).fetchone()
    if booking is None or not secrets.compare_digest(booking['access_token'], token):
        err('Booking not found.', 404)
    return booking


def safe_booking(booking):
    return {'reference': booking['reference'], 'status': booking['status'], 'amount': booking['amount'],
            'seats': json.loads(booking['seats']), 'expiresAt': booking['expires_at'],
            'receipt': booking['receipt'], 'phone': booking['phone'],
            'trip': trip_detail(booking['trip_id']), 'boarding': booking['boarding'], 'dropping': booking['dropping']}


def apply_provider_update(db, row, transaction):
    """Only server-verified gateway responses may set payment success, never client data."""
    if row['status'] in ('PAID', 'PAYMENT_REVIEW'):
        return
    if transaction.get('reference') != row['reference']:
        return
    try:
        amount = int(float(transaction.get('amount', -1)))
    except (TypeError, ValueError):
        return
    if amount != row['amount']:
        return
    trans_id = str(transaction.get('id', ''))
    if row['provider_transaction_id'] and trans_id and row['provider_transaction_id'] != trans_id:
        return
    status = str(transaction.get('status', '')).upper()
    if status in PAID_STATUSES:
        # Money received after hold expiry requires operator handling; don't claim reserved seat.
        state = 'PAID' if row['expires_at'] > now() else 'PAYMENT_REVIEW'
        receipt = transaction.get('mpesaReceipt') or (transaction.get('metadata') or {}).get('mpesaReceipt')
        db.execute("UPDATE bookings SET status=?, receipt=? WHERE reference=? AND status NOT IN ('PAID','PAYMENT_REVIEW')", (state, receipt, row['reference']))
    elif status in FAILED_STATUSES and row['status'] not in ('PAID', 'PAYMENT_REVIEW', 'EXPIRED'):
        db.execute("UPDATE bookings SET status=? WHERE reference=? AND status NOT IN ('PAID','PAYMENT_REVIEW','EXPIRED')", ('FAILED', row['reference']))


async def verify_provider_status(db, booking):
    ident = booking['provider_transaction_id']
    if not ident or not os.getenv('PAYLOR_API_KEY'):
        return
    try:
        async with httpx.AsyncClient(timeout=12) as client:
            response = await client.get(f'{PAYLOR_BASE}/merchants/payments/transactions/{ident}',
                                         headers={'Authorization': f"Bearer {os.getenv('PAYLOR_API_KEY')}"})
            response.raise_for_status()
            payload = response.json()
            tx = payload.get('transaction', payload)
            if isinstance(tx, dict):
                apply_provider_update(db, booking, tx)
    except (httpx.HTTPError, ValueError):
        # Do not invent success if provider is unreachable; signed callback may still arrive.
        pass


@app.get('/api/bookings/{reference}')
async def booking_status(reference: str, token: str, refresh: bool = False):
    with contextmanager_db() as db:
        booking = get_booking(db, reference, token)
        if refresh and booking['status'] not in ('PAID', 'PAYMENT_REVIEW'):
            await verify_provider_status(db, booking)
        refresh_expired(db)
        return safe_booking(get_booking(db, reference, token))


@app.post('/api/payments/stk')
async def initiate_payment(body: PaymentInput):
    if not LIVE_PAYMENTS_ENABLED:
        err('Live payments are disabled while using demo trip inventory. Connect real schedules and enable live payments after validation.', 503)
    key = os.getenv('PAYLOR_API_KEY', '')
    if not key or not os.getenv('PAYLOR_CHANNEL_ID', ''):
        err('Payment service is not configured yet. Please contact support.', 503)
    callback_base = os.getenv('PUBLIC_BASE_URL', '').rstrip('/')
    if not callback_base.startswith('https://'):
        err('Payment callback URL must be configured as a public HTTPS URL.', 503)
    # Reconcile first, then atomically claim permission to send the STK request.
    # This prevents two browser tabs from charging one booking twice.
    with contextmanager_db() as db:
        booking = get_booking(db, body.reference, body.token)
        if booking['status'] == 'PAYMENT_PENDING':
            await verify_provider_status(db, booking)
        booking = get_booking(db, body.reference, body.token)
        if booking['status'] in ('PAID', 'PAYMENT_REVIEW'):
            return {'reference': body.reference, 'status': booking['status']}
        if booking['expires_at'] <= now():
            err('Booking hold has expired. Please choose seats again.', 409)
        if booking['status'] in ('PAYMENT_PENDING','INITIATING'):
            return {'reference': body.reference, 'status': 'PENDING', 'message': 'Your payment is still pending. Check status before making another payment.'}
        if booking['provider_transaction_id'] and booking['status'] == 'FAILED':
            await verify_provider_status(db, booking)
            booking = get_booking(db, body.reference, body.token)
            if booking['status'] in ('PAID', 'PAYMENT_REVIEW'):
                return {'reference': body.reference, 'status': booking['status']}
        phone = phone_clean(body.phone or booking['phone'])
        db.execute('BEGIN IMMEDIATE')
        try:
            updated = db.execute("UPDATE bookings SET status='INITIATING', attempted_at=? WHERE reference=? AND status IN ('HELD','FAILED') AND expires_at > ?",
                                 (now(), booking['reference'], now()))
            db.execute('COMMIT')
        except Exception:
            db.execute('ROLLBACK')
            raise
        if updated.rowcount != 1:
            return {'reference': body.reference, 'status': 'PENDING', 'message': 'Another payment request is already in progress.'}
        attempt = booking['attempt_number'] + 1
        payload = {'phone': phone, 'amount': booking['amount'], 'reference': booking['reference'],
                   'channelId': os.environ['PAYLOR_CHANNEL_ID'], 'description': 'ENA Coach bus ticket',
                   'callbackUrl': f'{callback_base}/api/webhooks/paylor'}
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                response = await client.post(f'{PAYLOR_BASE}/merchants/payments/stk-push', json=payload,
                     headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json',
                              'Idempotency-Key': f"{booking['reference']}-attempt-{attempt}"})
                response.raise_for_status()
                provider = response.json()
        except httpx.HTTPStatusError:
            db.execute("UPDATE bookings SET status='FAILED' WHERE reference=? AND status='INITIATING'", (booking['reference'],))
            err('The payment provider rejected this request. Check payment details and try again.', 502)
        except (httpx.RequestError, ValueError):
            # Timeout is ambiguous: Paylor may have received the request. Never auto-retry.
            db.execute("UPDATE bookings SET status='PAYMENT_PENDING' WHERE reference=? AND status='INITIATING'", (booking['reference'],))
            err('Could not confirm whether the prompt was sent. Do not retry payment until support verifies it; manual steps are available.', 502)
        trans_id = provider.get('transactionId')
        if not trans_id:
            db.execute("UPDATE bookings SET status='PAYMENT_PENDING' WHERE reference=? AND status='INITIATING'", (booking['reference'],))
            err('Paylor did not return a transaction ID. Contact support before retrying.', 502)
        # A fast Paylor webhook might already have marked the order PAID.
        db.execute("UPDATE bookings SET status='PAYMENT_PENDING', phone=?, provider_transaction_id=?, attempted_at=?, attempt_number=? WHERE reference=? AND status='INITIATING'",
                   (phone, str(trans_id), now(), attempt, booking['reference']))
        return {'reference': booking['reference'], 'status': 'PENDING', 'message': 'Check your phone for the M-Pesa prompt.'}


@app.post('/api/webhooks/paylor')
async def paylor_webhook(request: Request):
    secret = os.getenv('PAYLOR_WEBHOOK_SECRET') or os.getenv('PAYLOR_WEBHOOK_ID', '')
    if not secret:
        err('Webhook secret not configured', 503)
    raw = await request.body()
    signature = request.headers.get('x-webhook-signature', '')
    expected = hmac.new(secret.encode(), raw, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature.lower(), expected):
        err('Invalid webhook signature', 401)
    try:
        event = json.loads(raw)
    except ValueError:
        err('Invalid webhook JSON')
    if event.get('event') not in ('payment.success', 'payment.failed', 'transaction.updated'):
        return {'received': True}
    tx = event.get('transaction', {})
    if not isinstance(tx, dict):
        err('Invalid transaction payload')
    with contextmanager_db() as db:
        db.execute('BEGIN IMMEDIATE')
        try:
            row = db.execute('SELECT * FROM bookings WHERE reference=?', (tx.get('reference'),)).fetchone()
            if row:
                apply_provider_update(db, row, tx)
            db.execute('COMMIT')
        except Exception:
            db.execute('ROLLBACK')
            raise
    return {'received': True}
