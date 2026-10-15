import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copy,
  Info,
  LockKeyhole,
  MessageCircle,
  Smartphone,
  X,
} from 'lucide-react';

import { checkoutApi } from '../api/checkoutApi';
import { FareSidebar } from './PassengerDetails';
import './BookingPaymentModal.css';

const money = (amount) =>
  Number(amount || 0).toLocaleString('en-KE');

export default function BookingPayment() {
  const current = useMemo(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem('enaCurrentBooking') || 'null'
      );
    } catch {
      return null;
    }
  }, []);

  const [config, setConfig] = useState(null);
  const [booking, setBooking] = useState(null);

  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [manual, setManual] = useState(false);
  const [error, setError] = useState('');

  // M-Pesa is the currently integrated payment method.
  const [paymentMethod] = useState('mpesa');

  // Consent is checked by default.
  // Customers can uncheck it, which disables payment.
  const [consent, setConsent] = useState(true);

  const [secondsLeft, setSecondsLeft] = useState(() =>
    current
      ? Math.max(
          0,
          current.expiresAt - Math.floor(Date.now() / 1000)
        )
      : 0
  );

  const [phone, setPhone] = useState(
    current?.phone?.startsWith('254')
      ? current.phone.slice(3)
      : current?.phone || ''
  );

  // ==========================================
  // CHECK PAYMENT STATUS
  // ==========================================

  const check = useCallback(
    async (refresh = false) => {
      if (!current) return;

      setChecking(true);

      try {
        const data = await checkoutApi.status(
          current.reference,
          current.token,
          refresh
        );

        setBooking(data);
        return data;
      } catch (e) {
        setError(e.message || 'Unable to check payment status.');
      } finally {
        setChecking(false);
      }
    },
    [current]
  );

  // ==========================================
  // LOAD CONFIGURATION AND TIMER
  // ==========================================

  useEffect(() => {
    checkoutApi
      .config()
      .then(setConfig)
      .catch(() => setConfig({ manualEnabled: false }));

    check(true);

    const timer = window.setInterval(() => {
      if (current) {
        setSecondsLeft(
          Math.max(
            0,
            current.expiresAt - Math.floor(Date.now() / 1000)
          )
        );
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [check, current]);

  // ==========================================
  // AUTO-CHECK PENDING PAYMENTS
  // ==========================================

  // Keep checking while an STK request is pending or the popup is visible.
  useEffect(() => {
    if (!current || (booking?.status !== 'PAYMENT_PENDING' && !showModal)) {
      return;
    }

    const timer = window.setInterval(() => {
      check(true);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [booking?.status, check, current, showModal]);

  // Hide the processing popup when payment finishes, fails or the hold expires.
  useEffect(() => {
    if (
      ['PAID', 'PAYMENT_REVIEW', 'EXPIRED', 'FAILED', 'PAYMENT_FAILED',
        'DECLINED', 'CANCELLED'].includes(booking?.status) ||
      secondsLeft <= 0
    ) {
      setShowModal(false);
    }
  }, [booking?.status, secondsLeft]);

  // No visible close button in the reference design, but Escape still works.
  useEffect(() => {
    if (!showModal) return;
    const handleEscape = (event) => {
      if (event.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showModal]);

  // ==========================================
  // INITIATE M-PESA PAYMENT
  // ==========================================

  async function push() {
    // Do not allow payment without consent.
    if (!consent) {
      setError('Please agree to the payment terms to continue.');
      return;
    }

    if (paymentMethod !== 'mpesa') {
      setError('This payment method is not available yet.');
      return;
    }

    if (
      !current ||
      sending ||
      secondsLeft <= 0 ||
      booking?.status === 'PAYMENT_PENDING' ||
      booking?.status === 'PAID' ||
      booking?.status === 'PAYMENT_REVIEW' ||
      booking?.status === 'EXPIRED'
    ) {
      return;
    }

    setError('');
    setSending(true);

    try {
      const result = await checkoutApi.stk({
        reference: current.reference,
        token: current.token,
        phone,
      });

      await check(true);

      if (result.status === 'PENDING') {
        setShowModal(true);
      }
    } catch (e) {
      setError(e.message || 'Unable to initiate payment.');
      setShowModal(false);
    } finally {
      setSending(false);
    }
  }

  // ==========================================
  // EMPTY BOOKING
  // ==========================================

  if (!current) {
    return (
      <main className="bk-page bk-container bk-empty">
        <h2>No active booking</h2>
        <p>
          Choose your bus and seat to begin checkout.
        </p>
        <Link className="bk-primary bk-link-btn" to="/">
          Search buses
        </Link>
      </main>
    );
  }

  // ==========================================
  // PAYMENT STATES
  // ==========================================

  const status = booking?.status || current.status;

  const paid = status === 'PAID';
  const expired = secondsLeft <= 0 || status === 'EXPIRED';
  const review = status === 'PAYMENT_REVIEW';
  const pending = status === 'PAYMENT_PENDING';

  const canPay =
    consent &&
    !sending &&
    !expired &&
    !pending &&
    !paid &&
    !review &&
    paymentMethod === 'mpesa';

  const contactLink = config?.supportWhatsApp
    ? `https://wa.me/${config.supportWhatsApp}?text=${encodeURIComponent(
        `Hello, I need help with booking ${current.reference}`
      )}`
    : null;

  const formattedTime = `${Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0')}:${(secondsLeft % 60)
    .toString()
    .padStart(2, '0')}`;

  // ==========================================
  // MAIN PAYMENT PAGE
  // ==========================================

  return (
    <main className="bk-page bk-container bk-checkout-layout bk-payment-page">

      <div className="bk-payment-main">

        {/* PAYMENT SUCCESS */}
        {paid ? (
          <div className="bk-status-success">
            <CheckCircle2 size={38} />

            <h2>Payment confirmed!</h2>

            <p>
              Your booking <strong>{current.reference}</strong> is
              paid. Your M-Pesa receipt is{' '}
              <strong>
                {booking?.receipt || 'being updated'}
              </strong>.
            </p>

            <p>
              Save your reference and receipt for travel.
            </p>

            <Link className="bk-outline-btn" to="/">
              Back to homepage
            </Link>
          </div>
        ) : review ? (

          /* PAYMENT REVIEW */
          <div className="bk-status-review">
            <AlertTriangle size={34} />

            <h2>Payment needs review</h2>

            <p>
              Payment arrived after the seat hold expired.
              Do not book again yet; contact support with
              reference <strong>{current.reference}</strong> for
              reconciliation.
            </p>
          </div>

        ) : (
          <>

            {/* MANUAL PAYMENT LINK */}
            <button
              type="button"
              className="bk-manual-trigger"
              onClick={() => setManual(true)}
            >
              <Info size={15} />
              Manual Payment steps
            </button>

            {/* PAGE HEADING AND TIMER */}
            <div className="bk-payment-title">
              <h2>Payment Details</h2>

              <span className="bk-time-pill">
                <Clock size={13} />
                {formattedTime} Remaining
              </span>
            </div>

            {/* =====================================
                PAYMENT METHODS
               ===================================== */}

            <div className="bk-pay-method">

              <label>Select Payment Method</label>

              <div className="bk-payment-methods">

                {/* M-PESA */}
                <button
                  type="button"
                  className="
                    bk-payment-method-option
                    bk-payment-method-selected
                  "
                  aria-label="M-Pesa selected"
                  aria-pressed={true}
                >
                  <img
                    src="/assets/mpesa.png"
                    alt="M-Pesa"
                    className="bk-method-logo"
                  />

                  <span className="bk-method-name">
                    Mpesa
                  </span>
                </button>

                {/* AIRTEL MONEY */}
                <div
                  className="
                    bk-payment-method-option
                    bk-payment-method-unavailable
                  "
                  aria-label="Airtel Money payment is not yet available"
                  title="Airtel Money payment is not yet integrated"
                >
                  <img
                    src="/assets/airtel.png"
                    alt="Airtel Money"
                    className="bk-method-logo"
                  />

                  <span className="bk-method-name">
                    Airtel Money
                  </span>
                </div>

              </div>
            </div>

            {/* =====================================
                PHONE NUMBER
               ===================================== */}

            <label className="bk-payment-label">
              Phone Number
            </label>

            <div className="bk-pay-phone">
              <span>+254</span>

              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="712345678"
                aria-label="M-Pesa phone number"
              />
            </div>

            {/* =====================================
                PAYMENT WARNING
               ===================================== */}

            <div className="bk-warning">
              <AlertTriangle size={17} />

              <span>
                <strong>Note:</strong> Once seats are selected and
                paid for, ticket refunds are subject to the
                operator's policy.
              </span>
            </div>

            {/* =====================================
                CONSENT - CHECKED BY DEFAULT
               ===================================== */}

            <label className="bk-consent">

              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => {
                  const checked = e.target.checked;

                  setConsent(checked);

                  if (checked) {
                    setError('');
                  }
                }}
                aria-label="Agree to payment terms"
              />

              <span>
                By proceeding, I consent to securely processing
                this payment for my booking.
              </span>

            </label>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="bk-error" role="alert">
                {error}
              </div>
            )}

            {/* EXPIRED BOOKING */}
            {expired && (
              <div className="bk-error" role="alert">
                Your seat hold has expired. Please search and
                reserve seats again. If you already paid, contact
                support with your reference.
              </div>
            )}

            {/* =====================================
                PAY BUTTON
               ===================================== */}

            <button
              type="button"
              className="bk-pay-action"
              disabled={!canPay}
              onClick={push}
            >
              <LockKeyhole size={16} />

              {sending
                ? 'Sending M-Pesa prompt…'
                : pending
                  ? 'Payment request pending'
                  : 'Pay Securely with Mpesa'}
            </button>

            {/* PAYMENT STATUS ACTIONS */}
            <div className="bk-payment-tools">

              <button
                type="button"
                onClick={() => check(true)}
                disabled={checking}
              >
                {checking
                  ? 'Checking…'
                  : 'Check Payment Status'}
              </button>

              <button
                type="button"
                onClick={() => setManual(true)}
              >
                Didn't receive prompt? Pay manually
              </button>

            </div>

            {/* BOOKING REFERENCE */}
            <p className="bk-payment-ref">
              Booking reference:{' '}
              <b>{current.reference}</b>
            </p>

          </>
        )}
      </div>

      {/* =====================================
          FARE SIDEBAR
         ===================================== */}

      <FareSidebar
        booking={booking}
        draft={{
          trip: booking?.trip || current.trip,
          seats: booking?.seats || current.seats,
          boarding: current.boarding,
          dropping: current.dropping,
        }}
      />

      {/* =====================================
          PAYMENT PROCESSING MODAL
          Matches the reference screenshot:
          white 358x220 card, blue info icon,
          title, instruction and blue spinner.
          ===================================== */}

      {showModal && !paid && !review && !expired && (
        <div
          className="bk-processing-overlay"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div
            className="bk-processing-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bk-processing-heading"
            aria-describedby="bk-processing-description"
          >
            <Info
              className="bk-processing-symbol"
              size={62}
              strokeWidth={1.6}
              aria-hidden="true"
            />
            <h2 id="bk-processing-heading">Processing Payment</h2>
            <p id="bk-processing-description">
              Please complete the payment on your phone...
            </p>
            <div className="bk-processing-loading" role="status" aria-label="Waiting for payment confirmation" />
          </div>
        </div>
      )}

      {/* =====================================
          MANUAL PAYMENT MODAL
         ===================================== */}

      {manual && (
        <div
          className="bk-modal-backdrop"
          role="presentation"
        >
          <div
            className="bk-manual-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Manual Payment Steps"
          >

            <header>
              <h2>Manual Payment Steps</h2>

              <button
                type="button"
                aria-label="Close"
                onClick={() => setManual(false)}
              >
                <X size={20} />
              </button>
            </header>

            <div className="bk-manual-inner">

              <h3>
                <Smartphone size={17} />
                M-Pesa Paybill Payment
              </h3>

              {config?.manualEnabled ? (
                <>

                  <div className="bk-manual-highlight">

                    <div>
                      Paybill:{' '}
                      <strong>{config.paybill}</strong>

                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard?.writeText(
                            String(config.paybill)
                          )
                        }
                        aria-label="Copy paybill"
                      >
                        <Copy size={15} />
                      </button>
                    </div>

                    <div>
                      Account:{' '}
                      <strong>{config.account}</strong>

                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard?.writeText(
                            String(config.account)
                          )
                        }
                        aria-label="Copy account"
                      >
                        <Copy size={15} />
                      </button>
                    </div>

                    <div>
                      Amount:{' '}
                      <strong>
                        KES {money(booking?.amount ?? current.amount)}.00
                      </strong>
                    </div>

                  </div>

                  <ol>
                    <li>Open M-Pesa on your phone.</li>
                    <li>Select Lipa na M-Pesa.</li>
                    <li>Select Paybill.</li>
                    <li>
                      Enter the Paybill number:{' '}
                      <strong>{config.paybill}</strong>.
                    </li>
                    <li>
                      Enter the Account number:{' '}
                      <strong>{config.account}</strong>.
                    </li>
                    <li>
                      Enter the Amount:{' '}
                      <strong>
                        KES {money(booking?.amount ?? current.amount)}
                      </strong>.
                    </li>
                    <li>
                      Enter your M-Pesa PIN and confirm.
                    </li>
                    <li>
                      Keep your M-Pesa confirmation SMS for
                      verification.
                    </li>
                  </ol>

                  <p className="bk-manual-notice">
                    <strong>Important:</strong> Manual payments
                    require verification by our team. This page
                    will not automatically mark a manual payment
                    as successful. Complete payment before the
                    seat hold expires and contact support with
                    your M-Pesa receipt and booking reference:{' '}
                    <strong>{current.reference}</strong>.
                  </p>

                </>
              ) : (
                <p className="bk-manual-notice">
                  Manual Paybill payment is not configured yet.
                  Please contact support. Do not send money to
                  an unverified number.
                </p>
              )}

            </div>

            <div className="bk-manual-buttons">

              <button
                type="button"
                className="bk-outline-btn"
                disabled={!pending && !canPay}
                onClick={() => {
                  setManual(false);

                  if (pending) {
                    check(true);
                  } else {
                    push();
                  }
                }}
              >
                {pending
                  ? 'Check Pending Payment'
                  : 'Retry STK Push'}
              </button>

              <button
                type="button"
                className="bk-black-btn"
                onClick={() => {
                  setManual(false);
                  check(true);
                }}
              >
                Check Payment
              </button>

            </div>

            {contactLink ? (
              <a
                className="bk-support-footnote"
                href={contactLink}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={16} />
                Contact support via WhatsApp
              </a>
            ) : (
              <Link
                to="/support"
                className="bk-support-footnote"
              >
                
              </Link>
            )}

          </div>
        </div>
      )}

    </main>
  );
}