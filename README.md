# ENA Coach — extended booking and Paylor checkout

The existing React/Vite site is preserved. The added booking flow is `/booking/results` → `/booking/passengers` → `/booking/payment` with a responsive seat map and Paylor STK server integration.

**Important:** Current trip schedules, coach names, fares and the initial booked-seat pattern are **demonstration data** because the supplied ZIP has no real fleet timetable, ticket inventory or operator service. Seat reservations made on this site persist in SQLite, but do **not** reserve a physical ENA Coach seat without an operator inventory integration. Do not take payments for actual travel using this sample inventory. `LIVE_PAYMENTS_ENABLED=false` prevents charging customers by default. Only turn it on once actual schedules, seat availability, fares, and operational fulfilment have been integrated and verified.

## Run locally

Requirements: Node 20+, Python 3.11+.

```bash
cp .env.example .env
# Fill in .env details as described below
python -m venv .venv
source .venv/bin/activate
pip install -r server/requirements.txt
uvicorn server.main:app --reload --host 127.0.0.1 --port 8000
```

Start a second terminal at project root:

```bash
npm ci
npm run dev
```

Visit `http://localhost:5173`. The Vite dev server proxies `/api` to FastAPI port 8000. The homepage defaults to **One Way**. Search moves to results instead of showing inline sample cards.

## Configure Paylor

Set your **Paylor API key**, **Webhook ID (Secret)** and **Payment Channel ID/Alias** as `PAYLOR_API_KEY`, `PAYLOR_WEBHOOK_SECRET` and `PAYLOR_CHANNEL_ID` respectively in the root `.env`. Per the Paylor docs, STK Push calls `POST https://api.paylorke.com/api/v1/merchants/payments/stk-push` with `phone`, the *server-calculated* `amount`, unique `reference`, `channelId` and public `callbackUrl`. Your credentials never go into `VITE_*` variables or browser code.

- Set `PUBLIC_BASE_URL=https://your-live-https-api-domain` so the webhook endpoint `https://your-live-https-api-domain/api/webhooks/paylor` is accessible to Paylor. For development, you can use a secure HTTPS tunnel and that tunnel's public URL.
- Your API key requires `payments:create` and `transactions:read` scopes. The webhook HMAC-SHA256 is checked against the raw body with the `X-Webhook-Signature` header.
- STK payments are only marked paid on a signed provider callback or server-to-server transaction status check. A missed/late webhook can be reconciled from `GET /api/v1/merchants/payments/transactions/:transactionId`.
- Populate `MANUAL_PAYBILL_NUMBER` and `MANUAL_ACCOUNT_NUMBER` to display your own verified fallback payment details when STK prompts are delayed. **Manual payment cannot be automatically verified by this integration** and needs your accounting/support team to reconcile payment receipts before issuing tickets.
- `SUPPORT_WHATSAPP` should be a full international number without + or spaces (for example `2547XXXXXXXX`, not an actual number). If not supplied, both floating support buttons open the existing support route.
- For browser CORS, set `FRONTEND_ORIGINS` to your frontend URL(s), comma-separated. Set `VITE_API_BASE_URL` only when your API is on a separate domain; otherwise proxy `/api` to the backend at your host/reverse proxy.
- Ensure your server's `.env` isn't served as a public asset and cannot be committed to your repository. Use HTTPS in production and persist your SQLite file on durable storage. Prefer a transactional shared RDBMS for multiple backend replicas.

## State & experience

1. Search: route, date, passenger count; **one-way defaults**. The original round-trip selection is retained, but return bookings are not implemented in this MVP and must be booked separately.
2. Result cards: view seats, filter route stops/departure and select available seats. Initial occupancy is deterministically pseudo-random per date/route/trip (unchanged across page refresh); real bookings remove seats from availability.
3. Boarding/dropping point and seats are saved to session storage for the passenger form.
4. Passenger form: each selected seat gets its own traveler details. Submitting starts a **15-minute seat hold** using a SQLite `BEGIN IMMEDIATE` transaction so two simultaneous users cannot reserve the same seat.
5. Paylor STK: initiate with server-generated reference, price and transaction ID. No duplicate STK request while a previous attempt is still pending. Webhook events are verified with HMAC and matched on original booking reference and amount. Late payment after hold expiry is flagged `PAYMENT_REVIEW`, not presented as a valid booked seat.
6. Fallback modal: own Paybill/account read from backend env; clearly labelled for manual payment. Contact support with booking reference + receipt.

## Tests

```bash
cd server
python -m pytest -q
```

Tests cover stable seat availability, seat collisions, booking access tokens, signed and duplicate webhooks, amount mismatch and the demo-mode payment guard. Real gateway end-to-end tests require your live Paylor credentials, public HTTPS callback and a test account; none are included in the archive.

## Production deployment

Build frontend with `npm run build` and serve `dist/` via a static host or Nginx. Proxy `/api` to Uvicorn (e.g. `uvicorn server.main:app --host 127.0.0.1 --port 8000`) and use TLS, process supervision, database backups and operational alerts. The `server` directory must remain private. **Do not rely on SQLite + sample schedules as a production ticketing inventory.**

Payment docs: https://docs.paylorke.com/local-payments#stk-push and https://docs.paylorke.com/webhooks
