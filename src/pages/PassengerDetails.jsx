import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Armchair, MapPin, ShieldCheck } from 'lucide-react';
import { checkoutApi } from '../api/checkoutApi';
import { categoryForSeat, ticketFare, totalFare } from '../utils/pricing';

const money = n => Number(n).toLocaleString('en-KE');
const newPassenger = () => ({ name: '', idNumber: '', nationality: 'Kenyan', age: '', gender: '', email: '', phone: '' });

export default function PassengerDetails() {
  const navigate = useNavigate();
  const draft = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('enaBookingDraft') || 'null'); } catch { return null; }
  }, []);
  const [passengers, setPassengers] = useState(() => Array.from({length: draft?.seats?.length || 1}, newPassenger));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!draft?.trip || !draft?.seats?.length) {
    return <main className="bk-page bk-container bk-empty"><h2>Choose your seats first</h2><p>Start with a bus search, select your seats and boarding point, then enter passenger details.</p><Link className="bk-primary bk-link-btn" to="/">Find buses</Link></main>;
  }
  const update = (index, field, value) => setPassengers(prev => prev.map((p, i) => i === index ? {...p, [field]: value} : p));

  async function submit(e) {
    e.preventDefault();setError('');setBusy(true);
    try {
      const data = await checkoutApi.reserve({tripId: draft.trip.id, seats: draft.seats,
        boarding: draft.boarding, dropping: draft.dropping,
        passengers: passengers.map(p => ({...p, age: Number(p.age)}))});
      sessionStorage.setItem('enaCurrentBooking', JSON.stringify(data));
      navigate('/booking/payment');
    } catch (ex) {setError(ex.message);} finally {setBusy(false);}
  }
  return <main className="bk-page bk-container bk-checkout-layout bk-passenger-page">
    <div>
      <h2 className="bk-page-title">PASSENGERS INFO</h2>
      <form className="bk-passenger-card" onSubmit={submit}>
        {passengers.map((person, index) => <section key={draft.seats[index]} className="bk-person-section">
          <div className="bk-person-head"><span>{index === 0 ? 'Primary Passenger' : `Passenger ${index + 1}`}</span><span><Armchair size={16}/> Seat: <strong>{draft.seats[index]}</strong></span></div>
          <div className="bk-detail-grid">
            <div className="bk-detail-subcard"><h3>PERSONAL DETAILS</h3><div className="bk-fields two">
              <label>Full Name<input required autoComplete="name" placeholder="Full Name" value={person.name} onChange={e=>update(index,'name',e.target.value)} minLength={3}/></label>
              <label>ID/Passport Number<input required placeholder="ID / Passport No" value={person.idNumber} onChange={e=>update(index,'idNumber',e.target.value)} minLength={4}/></label>
            </div><div className="bk-fields three">
              <label>Nationality<input required value={person.nationality} onChange={e=>update(index,'nationality',e.target.value)}/></label>
              <label>Age<input required type="number" min="1" max="120" placeholder="Age" value={person.age} onChange={e=>update(index,'age',e.target.value)}/></label>
              <label>Gender<select value={person.gender} required onChange={e=>update(index,'gender',e.target.value)}><option value="">Select</option><option>Female</option><option>Male</option><option>Other</option></select></label>
            </div></div>
            <div className="bk-detail-subcard"><h3>CONTACT INFO</h3><div className="bk-fields"><label>Email<input required type="email" autoComplete="email" placeholder="name@example.com" value={person.email} onChange={e=>update(index,'email',e.target.value)}/></label>
              <label>Phone Number<div className="bk-phone-input"><span>+254 Kenya</span><input required autoComplete="tel" type="tel" placeholder="712345678" value={person.phone} onChange={e=>update(index,'phone',e.target.value)}/></div></label></div></div>
          </div>
        </section>)}
        {error && <div className="bk-error" role="alert">{error}</div>}
        <div className="bk-passenger-actions"><button className="bk-coral-btn" type="submit" disabled={busy}>{busy ? 'Reserving seats…' : 'Proceed to Pay'}</button></div>
      </form>
      <p className="bk-under-note"><ShieldCheck size={15}/> Your seats will be reserved for 15 minutes when you proceed.</p>
    </div>
    <FareSidebar draft={draft}/>
  </main>;
}

export function FareSidebar({ draft, booking }) {
  const trip = booking?.trip || draft?.trip;
  if (!trip) return null;
  const seats = booking?.seats || draft?.seats || [];
  const amount = booking?.amount ?? totalFare(trip, seats);
  return <aside className="bk-fare-sidebar">
    <h3>Onward Trip</h3><div className="bk-route-summary"><div><small>Departure</small><b>{trip.departureTime}</b></div><div><small>Arrival</small><b>{trip.arrivalTime}</b></div></div>
    <div className="bk-route-summary bk-stops"><div><small>Boarding Point</small><b><MapPin size={13} color="#f04438"/>{trip.from.toUpperCase()}</b><span>{booking?.boarding || draft?.boarding}</span></div>
      <div><small>Dropping Point</small><b><MapPin size={13}/>{trip.to.toUpperCase()}</b><span>{booking?.dropping || draft?.dropping}</span></div></div>
    <div className="bk-sidebar-seats"><Armchair size={17}/> Selected Seats: <strong>{seats.join(', ')}</strong></div>
    <h3 className="bk-fare-heading">FARE BREAKUP</h3><p className="bk-breakup-row"><span>Onward Journey</span></p>
    {seats.map(number => <p className="bk-breakup-row" key={number}>
      <span>Seat {number} · {categoryForSeat(number)}</span>
      <span>KES {money(ticketFare(trip, number))}</span>
    </p>)}
    <p className="bk-breakup-row bold"><span>Onward Fare</span><span>KES {money(amount)}</span></p>
    <div className="bk-breakup-divider"/><p className="bk-breakup-row"><span>Additional Fees</span></p><p className="bk-breakup-row"><span>Insurance</span><span>KES 0</span></p><p className="bk-breakup-row"><span>Discount</span><span className="red">KES 0</span></p>
    <div className="bk-total-payable"><b>Total Payable</b><b>KES {money(amount)}.00</b></div>
  </aside>;
}
