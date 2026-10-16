"""ENA Coach — booking, seat inventory and Paylor payment API.

Compatible with the existing React booking pages and the Render deployment.

IMPORTANT: The currently generated trip schedules and initial seat availability are
synthetic. SQLite on Render Free is ephemeral, so this service must not be treated
as a durable paid-ticket ledger. Keep LIVE_PAYMENTS_ENABLED=false for demos.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import os
import random
import re
import secrets
import sqlite3
import time
from contextlib import contextmanager
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# -----------------------------------------------------------------------------
# Application settings
# -----------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
load_dotenv(PROJECT_DIR / ".env")

LOCAL_TZ = ZoneInfo("Africa/Nairobi")
DB_PATH = os.getenv("BOOKING_DB_PATH", str(BASE_DIR / "bookings.sqlite3"))
PAYLOR_BASE = os.getenv("PAYLOR_BASE_URL", "https://api.paylorke.com/api/v1").rstrip("/")
LIVE_PAYMENTS_ENABLED = os.getenv("LIVE_PAYMENTS_ENABLED", "false").strip().lower() == "true"
HOLD_SECONDS = max(1, int(os.getenv("BOOKING_HOLD_MINUTES", "15"))) * 60

# The production origin is explicitly supported even if FRONTEND_ORIGINS was
# omitted in Render, or still contains only localhost. Extra origins are optional.
DEFAULT_FRONTEND_ORIGINS = (
    "https://tahmeed-express.onrender.com",
"https://tahmeedbusexpress.com",
	"http://localhost:5173",
    "http://127.0.0.1:5173",
)


def allowed_origins() -> list[str]:
    configured = os.getenv("FRONTEND_ORIGINS", "")
    candidates = [*DEFAULT_FRONTEND_ORIGINS, *configured.split(",")]
    origins: list[str] = []
    for candidate in candidates:
        origin = candidate.strip().rstrip("/")
        if origin.startswith(("https://", "http://")) and origin not in origins:
            origins.append(origin)
    return origins


app = FastAPI(title="ENA Coach booking and payment service", version="1.1")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    max_age=600,
)


# -----------------------------------------------------------------------------
# Temporary/generated trip inventory (same API contract as current frontend)
# -----------------------------------------------------------------------------
# Prices and durations come from src/data/routePrices.js through the generated
# server/route_catalog.json. Run node scripts/sync-route-catalog.mjs to refresh.
# Kept inside server/ so Render deployments with Root Directory=server work.
with (BASE_DIR / 'route_catalog.json').open(encoding='utf-8') as data_file:
    ROUTE_CATALOG = json.load(data_file)
TOWNS = ROUTE_CATALOG['places']
ROUTES = ROUTE_CATALOG['routes']
TRIP_TIMES = [
    ('01:00 PM', 'MARCOPOLO II'),
    ('02:30 PM', 'POLO G2'),
]
TERMINALS = {
    'MOMBASA': ['Mombasa CBD', 'Mwembe Tayari', 'Changamwe'],
    'NAIROBI': ['Nairobi CBD', 'Muthurwa', 'Westlands'],
    'MUMIAS': ['Mumias Town', 'Mumias Bus Park'],
}


def normalize_place(value: str) -> str:
    return str(value).strip().upper()


def seat_class(seat_number: int) -> str:
    # Matches the existing seat-layout legend exactly.
    return 'VIP' if seat_number <= 8 else 'Business' if seat_number >= 37 else 'Normal'


def fare_for_seat(trip: dict, seat_number: int) -> int:
    if seat_number < 1 or seat_number > 49:
        err('Invalid seat number')
    key = {'Normal': 'normal', 'Business': 'bClass', 'VIP': 'vip'}[seat_class(seat_number)]
    return int(trip['fares'][key])


def formatted_duration(hours: float) -> str:
    total_minutes = round(float(hours) * 60)
    h, m = divmod(total_minutes, 60)
    return f'{h}h {m:02d}m' if h else f'{m}m'


def arrival_time(travel_date: str, departure: str, hours: float) -> str:
    time_value = datetime.strptime(departure, '%I:%M %p').time()
    start = datetime.combine(date.fromisoformat(travel_date), time_value)
    return (start + timedelta(minutes=round(float(hours) * 60))).strftime('%I:%M %p')


PAID_STATUSES = {"COMPLETED", "SUCCESS", "SUCCESSFUL"}
FAILED_STATUSES = {"FAILED", "CANCELLED", "CANCELED", "REJECTED"}
ACTIVE_HOLD_STATUSES = ("HELD", "INITIATING", "PAYMENT_PENDING", "FAILED")


def now() -> int:
    return int(time.time())


def err(message: str, code: int = 400) -> None:
    raise HTTPException(status_code=code, detail=message)


def phone_clean(phone: str) -> str:
    digits = re.sub(r"\D", "", str(phone))
    if digits.startswith("0") and len(digits) == 10:
        digits = "254" + digits[1:]
    elif len(digits) == 9 and digits.startswith(("7", "1")):
        digits = "254" + digits
    if not re.fullmatch(r"254[17]\d{8}", digits):
        err("Enter a valid Kenyan phone number (e.g. 0712345678).")
    return digits


def validate_trip(trip_id: str) -> tuple[str, str, str, int]:
    parts = trip_id.split('|')
    if len(parts) != 4:
        err('Invalid trip identifier')
    raw_date, raw_source, raw_destination, slot = parts
    try:
        travel_date = date.fromisoformat(raw_date)
    except ValueError:
        err('Invalid travel date')
    source, destination = normalize_place(raw_source), normalize_place(raw_destination)
    if source not in ROUTES or destination not in ROUTES.get(source, {}) or slot not in ('0', '1'):
        err('Invalid trip route')
    if travel_date < datetime.now(LOCAL_TZ).date():
        err('Travel date is in the past')
    return raw_date, source, destination, int(slot)


def trip_detail(trip_id: str) -> dict[str, Any]:
    travel_date, source, destination, slot = validate_trip(trip_id)
    route = ROUTES[source][destination]
    departure, coach = TRIP_TIMES[slot]
    duration_hrs = float(route['durationHrs'])
    # Keep the exact supplied class prices, including any unusual tier ordering.
    fares = {key: int(route[key]) for key in ('normal', 'bClass', 'vip')}
    from_label, to_label = source.title(), destination.title()
    return {
        'id': trip_id,
        'date': travel_date,
        'from': from_label,
        'to': to_label,
        'departureTime': departure,
        'arrivalTime': arrival_time(travel_date, departure, duration_hrs),
        'duration': formatted_duration(duration_hrs),
        'coach': coach,
        'fare': fares['normal'],
        'fares': fares,
        'estimatedFare': bool(route['estimated']),
        'className': 'VIP / Business / Normal',
        'amenities': ['Wi-Fi', 'USB charging', 'Air conditioning'],
        'routeLabel': f'{source}-{destination}',
        'boardingPoints': TERMINALS.get(source, [f'{from_label} Town', f'{from_label} Bus Park']),
        'droppingPoints': TERMINALS.get(destination, [f'{to_label} Town', f'{to_label} Bus Park']),
    }


def demo_seat_inventory(trip_id: str) -> set[int]:
    """Stable pseudo-random starting seats, so refreshes don't reshuffle them."""
    digest = hashlib.sha256(trip_id.encode("utf-8")).digest()
    seats = list(range(1, 50))
    random.Random(int.from_bytes(digest, "big")).shuffle(seats)
    return set(seats[: 11 + digest[0] % 7])


# -----------------------------------------------------------------------------
# SQLite: ephemeral on Render Free; still enforces atomic holds while running.
# -----------------------------------------------------------------------------
def connection() -> sqlite3.Connection:
    db = sqlite3.connect(DB_PATH, timeout=20, isolation_level=None)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA busy_timeout=20000")
    db.execute("PRAGMA journal_mode=WAL")
    return db


@contextmanager
def contextmanager_db():
    db = connection()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    with contextmanager_db() as db:
        db.execute(
            """CREATE TABLE IF NOT EXISTS bookings (
                reference TEXT PRIMARY KEY,
                access_token TEXT NOT NULL,
                trip_id TEXT NOT NULL,
                seats TEXT NOT NULL,
                boarding TEXT NOT NULL,
                dropping TEXT NOT NULL,
                passengers TEXT NOT NULL,
                phone TEXT NOT NULL,
                amount INTEGER NOT NULL,
                created_at INTEGER NOT NULL,
                expires_at INTEGER NOT NULL,
                status TEXT NOT NULL,
                provider_transaction_id TEXT,
                receipt TEXT,
                attempted_at INTEGER,
                attempt_number INTEGER NOT NULL DEFAULT 0
            )"""
        )
        db.execute(
            "CREATE INDEX IF NOT EXISTS idx_bookings_trip "
            "ON bookings(trip_id, status, expires_at)"
        )


init_db()


def refresh_expired(db: sqlite3.Connection) -> None:
    db.execute(
        """UPDATE bookings SET status='EXPIRED'
           WHERE status IN ('HELD','INITIATING','PAYMENT_PENDING','FAILED')
             AND expires_at <= ?""",
        (now(),),
    )


def occupied(db: sqlite3.Connection, trip_id: str) -> set[int]:
    refresh_expired(db)
    records = db.execute(
        """SELECT seats FROM bookings WHERE trip_id = ?
           AND (status='PAID' OR
              (status IN ('HELD','INITIATING','PAYMENT_PENDING','FAILED')
               AND expires_at > ?))""",
        (trip_id, now()),
    ).fetchall()
    return {seat for record in records for seat in json.loads(record["seats"])}


def seats_for_trip(db: sqlite3.Connection, trip_id: str) -> list[dict[str, Any]]:
    free = demo_seat_inventory(trip_id) - occupied(db, trip_id)
    trip = trip_detail(trip_id)
    return [
        {
            'number': number,
            'category': seat_class(number),
            'available': number in free,
            'price': fare_for_seat(trip, number),
        }
        for number in range(1, 50)
    ]


# -----------------------------------------------------------------------------
# Request schemas — field names intentionally match the existing React pages.
# -----------------------------------------------------------------------------
class SearchInput(BaseModel):
    from_: str = Field(alias="from")
    to: str
    date: str
    passengers: int = Field(default=1, ge=1, le=8)
    tripType: str = "one-way"
    returnDate: str | None = None


class Passenger(BaseModel):
    name: str = Field(min_length=3, max_length=120)
    idNumber: str = Field(min_length=4, max_length=35)
    nationality: str = Field(default="Kenyan", min_length=2, max_length=60)
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


# -----------------------------------------------------------------------------
# Health, frontend config, search, seat map, reservations
# -----------------------------------------------------------------------------
@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/config")
def public_config():
    paybill = os.getenv("MANUAL_PAYBILL_NUMBER", "")
    account = os.getenv("MANUAL_ACCOUNT_NUMBER", "")
    return {
        "paybill": paybill,
        "account": account,
        "manualEnabled": bool(LIVE_PAYMENTS_ENABLED and paybill and account),
        "supportWhatsApp": re.sub(r"\D", "", os.getenv("SUPPORT_WHATSAPP", "")),
        "supportEmail": os.getenv("SUPPORT_EMAIL", "info@enacoach.co.ke"),
        "holdMinutes": HOLD_SECONDS // 60,
        "demoInventory": not LIVE_PAYMENTS_ENABLED,
    }


@app.post("/api/bookings/search")
def search_trips(body: SearchInput):
    source, destination = normalize_place(body.from_), normalize_place(body.to)
    if source not in ROUTES or destination not in ROUTES.get(source, {}):
        err('Choose two different towns from the route list.')
    try:
        travel_date = date.fromisoformat(body.date)
    except ValueError:
        err("Invalid travel date.")
    if travel_date < datetime.now(LOCAL_TZ).date():
        err("Travel date cannot be in the past.")
    result = []
    with contextmanager_db() as db:
        for slot in range(len(TRIP_TIMES)):
            trip = trip_detail(f'{body.date}|{source}|{destination}|{slot}')
            trip["seatsLeft"] = sum(
                seat["available"] for seat in seats_for_trip(db, trip["id"])
            )
            result.append(trip)
    return result


@app.get("/api/trips/{trip_id:path}/seats")
def get_seats(trip_id: str):
    trip = trip_detail(trip_id)
    with contextmanager_db() as db:
        seats = seats_for_trip(db, trip_id)
    return {"trip": trip, "seats": seats, "seatsLeft": sum(s["available"] for s in seats)}


@app.post("/api/bookings")
def reserve(body: BookingInput):
    trip = trip_detail(body.tripId)
    if len(body.seats) != len(body.passengers) or len(body.seats) != len(set(body.seats)):
        err("Provide one distinct seat and passenger per ticket.")
    if body.boarding not in trip["boardingPoints"] or body.dropping not in trip["droppingPoints"]:
        err("Choose a valid boarding and dropping point.")
    if any(
        passenger.gender not in ("Male", "Female", "Other")
        or "@" not in passenger.email
        or "." not in passenger.email.split("@")[-1]
        for passenger in body.passengers
    ):
        err("Check the passenger details and email address.")

    phone = phone_clean(body.passengers[0].phone)
    reference = "ENA-" + secrets.token_hex(6).upper()
    token = secrets.token_urlsafe(32)
    created = now()

    with contextmanager_db() as db:
        db.execute("BEGIN IMMEDIATE")
        try:
            available = {seat["number"] for seat in seats_for_trip(db, body.tripId) if seat["available"]}
            if not set(body.seats).issubset(available):
                err("One or more seats are no longer available. Please select different seats.", 409)
            amount = sum(fare_for_seat(trip, seat) for seat in body.seats)
            db.execute(
                """INSERT INTO bookings (
                    reference, access_token, trip_id, seats, boarding, dropping,
                    passengers, phone, amount, created_at, expires_at, status
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    reference,
                    token,
                    body.tripId,
                    json.dumps(body.seats),
                    body.boarding,
                    body.dropping,
                    json.dumps([p.model_dump() for p in body.passengers]),
                    phone,
                    amount,
                    created,
                    created + HOLD_SECONDS,
                    "HELD",
                ),
            )
            db.execute("COMMIT")
        except Exception:
            db.execute("ROLLBACK")
            raise

    return {
        "reference": reference,
        "token": token,
        "amount": amount,
        "expiresAt": created + HOLD_SECONDS,
        "status": "HELD",
        "phone": phone,
    }


def get_booking(db: sqlite3.Connection, reference: str, token: str):
    booking = db.execute("SELECT * FROM bookings WHERE reference=?", (reference,)).fetchone()
    if booking is None or not secrets.compare_digest(booking["access_token"], token):
        err("Booking not found.", 404)
    return booking


def safe_booking(booking: sqlite3.Row) -> dict[str, Any]:
    return {
        "reference": booking["reference"],
        "status": booking["status"],
        "amount": booking["amount"],
        "seats": json.loads(booking["seats"]),
        "expiresAt": booking["expires_at"],
        "receipt": booking["receipt"],
        "phone": booking["phone"],
        "trip": trip_detail(booking["trip_id"]),
        "boarding": booking["boarding"],
        "dropping": booking["dropping"],
    }


# -----------------------------------------------------------------------------
# Paylor transaction verification and callback handling
# -----------------------------------------------------------------------------
def apply_provider_update(db: sqlite3.Connection, booking: sqlite3.Row, tx: dict[str, Any]) -> None:
    """Only server-verified updates can mark payment success.

    A successful transaction received after the seat hold expires is queued for
    operator review, not automatically treated as a confirmed ticket.
    """
    if booking["status"] in ("PAID", "PAYMENT_REVIEW"):
        return
    if tx.get("reference") != booking["reference"]:
        return
    try:
        amount = int(float(tx.get("amount", -1)))
    except (TypeError, ValueError, OverflowError):
        return
    if amount != booking["amount"]:
        return

    transaction_id = str(tx.get("id", ""))
    if booking["provider_transaction_id"] and transaction_id:
        if booking["provider_transaction_id"] != transaction_id:
            return

    status = str(tx.get("status", "")).upper()
    if status in PAID_STATUSES:
        new_status = "PAID" if booking["expires_at"] > now() else "PAYMENT_REVIEW"
        metadata = tx.get("metadata") or {}
        if not isinstance(metadata, dict):
            metadata = {}
        receipt = tx.get("mpesaReceipt") or metadata.get("mpesaReceipt")
        db.execute(
            """UPDATE bookings SET status=?, receipt=?
               WHERE reference=? AND status NOT IN ('PAID','PAYMENT_REVIEW')""",
            (new_status, receipt, booking["reference"]),
        )
    elif status in FAILED_STATUSES and booking["status"] not in ("EXPIRED",):
        db.execute(
            """UPDATE bookings SET status='FAILED'
               WHERE reference=? AND status NOT IN ('PAID','PAYMENT_REVIEW','EXPIRED')""",
            (booking["reference"],),
        )


async def verify_provider_status(db: sqlite3.Connection, booking: sqlite3.Row) -> None:
    transaction_id = booking["provider_transaction_id"]
    key = os.getenv("PAYLOR_API_KEY", "")
    if not transaction_id or not key:
        return
    try:
        async with httpx.AsyncClient(timeout=12) as client:
            response = await client.get(
                f"{PAYLOR_BASE}/merchants/payments/transactions/{transaction_id}",
                headers={"Authorization": f"Bearer {key}"},
            )
            response.raise_for_status()
            payload = response.json()
            tx = payload.get("transaction", payload) if isinstance(payload, dict) else None
            if isinstance(tx, dict):
                apply_provider_update(db, booking, tx)
    except (httpx.HTTPError, ValueError):
        # Never assume success when the provider is unreachable.
        pass


@app.get("/api/bookings/{reference}")
async def booking_status(reference: str, token: str, refresh: bool = False):
    with contextmanager_db() as db:
        booking = get_booking(db, reference, token)
        if refresh and booking["status"] not in ("PAID", "PAYMENT_REVIEW"):
            await verify_provider_status(db, booking)
        refresh_expired(db)
        return safe_booking(get_booking(db, reference, token))


@app.post("/api/payments/stk")
async def initiate_payment(body: PaymentInput):
    if not LIVE_PAYMENTS_ENABLED:
        err(
            "Live payments are disabled while using demo trip inventory. "
            "Connect real schedules and enable live payments after validation.",
            503,
        )

    key = os.getenv("PAYLOR_API_KEY", "")
    channel = os.getenv("PAYLOR_CHANNEL_ID", "")
    callback_base = os.getenv("PUBLIC_BASE_URL", "").rstrip("/")
    if not key or not channel:
        err("Payment service is not configured yet. Please contact support.", 503)
    if not callback_base.startswith("https://"):
        err("Payment callback URL must be configured as a public HTTPS URL.", 503)

    with contextmanager_db() as db:
        booking = get_booking(db, body.reference, body.token)
        if booking["status"] == "PAYMENT_PENDING":
            await verify_provider_status(db, booking)
        booking = get_booking(db, body.reference, body.token)
        if booking["status"] in ("PAID", "PAYMENT_REVIEW"):
            return {"reference": body.reference, "status": booking["status"]}
        if booking["expires_at"] <= now():
            err("Booking hold has expired. Please choose seats again.", 409)
        if booking["status"] in ("PAYMENT_PENDING", "INITIATING"):
            return {
                "reference": body.reference,
                "status": "PENDING",
                "message": "Your payment is still pending. Check status before making another payment.",
            }
        if booking["provider_transaction_id"] and booking["status"] == "FAILED":
            await verify_provider_status(db, booking)
            booking = get_booking(db, body.reference, body.token)
            if booking["status"] in ("PAID", "PAYMENT_REVIEW"):
                return {"reference": body.reference, "status": booking["status"]}

        phone = phone_clean(body.phone or booking["phone"])
        db.execute("BEGIN IMMEDIATE")
        try:
            updated = db.execute(
                """UPDATE bookings SET status='INITIATING', attempted_at=?
                   WHERE reference=? AND status IN ('HELD','FAILED') AND expires_at > ?""",
                (now(), booking["reference"], now()),
            )
            db.execute("COMMIT")
        except Exception:
            db.execute("ROLLBACK")
            raise

        if updated.rowcount != 1:
            return {
                "reference": body.reference,
                "status": "PENDING",
                "message": "Another payment request is already in progress.",
            }

        attempt = booking["attempt_number"] + 1
        payload = {
            "phone": phone,
            "amount": booking["amount"],
            "reference": booking["reference"],
            "channelId": channel,
            "description": "ENA Coach bus ticket",
            "callbackUrl": f"{callback_base}/api/webhooks/paylor",
        }
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                response = await client.post(
                    f"{PAYLOR_BASE}/merchants/payments/stk-push",
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {key}",
                        "Content-Type": "application/json",
                        "Idempotency-Key": f"{booking['reference']}-attempt-{attempt}",
                    },
                )
                response.raise_for_status()
                provider = response.json()
        except httpx.HTTPStatusError:
            db.execute(
                "UPDATE bookings SET status='FAILED' WHERE reference=? AND status='INITIATING'",
                (booking["reference"],),
            )
            err("The payment provider rejected this request. Check payment details and try again.", 502)
        except (httpx.RequestError, ValueError):
            # Ambiguous network failures MUST NOT trigger automatic duplicate STK pushes.
            db.execute(
                "UPDATE bookings SET status='PAYMENT_PENDING' WHERE reference=? AND status='INITIATING'",
                (booking["reference"],),
            )
            err(
                "Could not confirm whether the prompt was sent. Do not retry payment "
                "until support verifies it; manual steps are available.",
                502,
            )

        transaction_id = provider.get("transactionId") if isinstance(provider, dict) else None
        if not transaction_id:
            db.execute(
                "UPDATE bookings SET status='PAYMENT_PENDING' WHERE reference=? AND status='INITIATING'",
                (booking["reference"],),
            )
            err("Paylor did not return a transaction ID. Contact support before retrying.", 502)

        db.execute(
            """UPDATE bookings
               SET status='PAYMENT_PENDING', phone=?, provider_transaction_id=?,
                   attempted_at=?, attempt_number=?
               WHERE reference=? AND status='INITIATING'""",
            (phone, str(transaction_id), now(), attempt, booking["reference"]),
        )
        return {
            "reference": booking["reference"],
            "status": "PENDING",
            "message": "Check your phone for the M-Pesa prompt.",
        }


@app.post("/api/webhooks/paylor")
async def paylor_webhook(request: Request):
    # PAYLOR_WEBHOOK_ID is kept as a compatibility fallback with the original code.
    secret = os.getenv("PAYLOR_WEBHOOK_SECRET") or os.getenv("PAYLOR_WEBHOOK_ID", "")
    if not secret:
        err("Webhook secret not configured", 503)

    raw = await request.body()
    signature = request.headers.get("x-webhook-signature", "")
    expected = hmac.new(secret.encode("utf-8"), raw, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature.lower(), expected):
        err("Invalid webhook signature", 401)

    try:
        event = json.loads(raw)
    except ValueError:
        err("Invalid webhook JSON")
    if not isinstance(event, dict):
        err("Invalid webhook JSON")
    if event.get("event") not in ("payment.success", "payment.failed", "transaction.updated"):
        return {"received": True}

    tx = event.get("transaction", {})
    if not isinstance(tx, dict):
        err("Invalid transaction payload")
    with contextmanager_db() as db:
        db.execute("BEGIN IMMEDIATE")
        try:
            booking = db.execute(
                "SELECT * FROM bookings WHERE reference=?", (tx.get("reference"),)
            ).fetchone()
            if booking:
                apply_provider_update(db, booking, tx)
            db.execute("COMMIT")
        except Exception:
            db.execute("ROLLBACK")
            raise
    return {"received": True}
