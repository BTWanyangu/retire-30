import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BusFront, Clock3, MapPin, Search, ShieldCheck, Star, Wifi, X } from 'lucide-react';
import { checkoutApi } from '../api/checkoutApi';

const money = (amount) => Number(amount).toLocaleString('en-KE');
const demoText = '';
const seatCss = (seat, selected) => !seat.available ? 'seat-booked' : selected ? 'seat-selected' :
  seat.category === 'VIP' ? 'seat-vip' : seat.category === 'Business' ? 'seat-business' : 'seat-normal';

function SeatMap({ seats, chosen, onSeat, limit }) {
  const find = (n) => seats.find(s => s.number === n);
  const cell = (n) => {
    const seat = find(n);
    return seat ? <button key={n} type="button" disabled={!seat.available}
      aria-label={`Seat ${n}, ${seat.available ? seat.category + ' available' : 'booked'}`}
      aria-pressed={chosen.includes(n)} title={`Seat ${n} · ${seat.category}`}
      className={`coach-seat ${seatCss(seat, chosen.includes(n))}`}
      onClick={() => onSeat(n)}>{n}</button> : null;
  };
  return <div className="seat-zone">
    <div className="seat-key"><span><i className="key-vip"/>VIP</span><span><i className="key-normal"/>Normal</span><span><i className="key-business"/>Business</span><span><i className="key-booked"/>Booked</span></div>
    <div className="coach-top"><span>DOOR</span><span className="wheel">◉</span></div>
    <div className="coach-grid" aria-label={`Choose up to ${limit} seats`}>
      {Array.from({ length: 12 }, (_, row) => <div className="coach-row" key={row}>
        <div className="coach-pair">{cell(4 * row + 3)}{cell(4 * row + 4)}</div>
        <div className="coach-aisle" aria-hidden="true"/>
        <div className="coach-pair">{cell(4 * row + 2)}{cell(4 * row + 1)}</div>
      </div>)}
      <div className="coach-row coach-back"><span/><span>{cell(49)}</span><span/></div>
    </div>
    <span className="seat-guide">Select {limit} {limit === 1 ? 'seat' : 'seats'} to continue</span>
  </div>;
}

export default function BookingResults() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const query = useMemo(() => ({ from: params.get('from') || '', to: params.get('to') || '', date: params.get('date') || '',
    passengers: Number(params.get('passengers') || 1), tripType: params.get('tripType') || 'one-way', returnDate: params.get('returnDate') || '' }), [params]);
  const [results, setResults] = useState([]);
  const [active, setActive] = useState('');
  const [seatData, setSeatData] = useState(null);
  const [chosen, setChosen] = useState([]);
  const [boarding, setBoarding] = useState('');
  const [dropping, setDropping] = useState('');
  const [load, setLoad] = useState(true);
  const [error, setError] = useState('');
  const [filterBoarding, setFilterBoarding] = useState('');
  const [filterDropping, setFilterDropping] = useState('');
  const [filterDeparture, setFilterDeparture] = useState('');
  const [onlyWifi, setOnlyWifi] = useState(false);

  useEffect(() => {
    let current = true;
    setLoad(true);setError('');
    checkoutApi.search(query).then(data => { if (current) setResults(data); }).catch(e => { if (current) setError(e.message); })
      .finally(() => { if (current) setLoad(false); });
    return () => {current = false;};
  }, [query]);

  async function chooseTrip(id) {
    if (active === id) { setActive(''); setSeatData(null); return; }
    setActive(id);setSeatData(null);setChosen([]);setBoarding('');setDropping('');setError('');
    try { setSeatData(await checkoutApi.seats(id)); }
    catch(e) {setError(e.message);setActive('');}
  }
  function selectSeat(n) {
    setError('');
    setChosen(old => old.includes(n) ? old.filter(i => i !== n) : old.length >= query.passengers ? [...old.slice(1), n] : [...old, n]);
  }
  const filtered = results.filter(t => (!filterBoarding || t.boardingPoints.includes(filterBoarding)) &&
    (!filterDropping || t.droppingPoints.includes(filterDropping)) &&
    (!filterDeparture || (filterDeparture === 'afternoon' ? t.departureTime.includes('PM') : t.departureTime.includes('AM'))) &&
    (!onlyWifi || (t.amenities || []).includes('Wi-Fi')));
  const selectionValid = chosen.length === query.passengers && boarding && dropping;
  function proceed() {
    if (!selectionValid) {setError(`Choose ${query.passengers} seat(s), a boarding point and a dropping point.`); return;}
    const draft = { trip: seatData.trip, seats: chosen.slice().sort((a,b)=>a-b), boarding, dropping, passengersCount: query.passengers };
    sessionStorage.setItem('enaBookingDraft', JSON.stringify(draft));
    navigate('/booking/passengers');
  }
  return <div className="bk-page">
    <div className="bk-blackbar"><div className="bk-container bk-bar-inner">
      <button aria-label="Back to home" onClick={() => navigate('/')}><ArrowLeft size={17}/></button>
      <BusFront size={23}/><span><b>{query.from.toUpperCase()} - {query.to.toUpperCase()}</b><small>{query.date}</small></span>
    </div></div>
    <div className="bk-container bk-results-wrap">
      <div className="bk-filters">
        <button className="bk-pill-dark" onClick={()=>navigate('/')}>Modify Trip</button>
        <label className="bk-filter"><MapPin size={16}/><select aria-label="Filter boarding" value={filterBoarding} onChange={e=>setFilterBoarding(e.target.value)}><option value="">Boarding</option>{[...new Set(results.flatMap(r=>r.boardingPoints))].map(x=><option key={x}>{x}</option>)}</select></label>
        <label className="bk-filter"><MapPin size={16}/><select aria-label="Filter dropping" value={filterDropping} onChange={e=>setFilterDropping(e.target.value)}><option value="">Dropping</option>{[...new Set(results.flatMap(r=>r.droppingPoints))].map(x=><option key={x}>{x}</option>)}</select></label>
        <label className="bk-filter"><Clock3 size={16}/><select aria-label="Filter departure" value={filterDeparture} onChange={e=>setFilterDeparture(e.target.value)}><option value="">Departure</option><option value="morning">Morning</option><option value="afternoon">Afternoon / Evening</option></select></label>
        <label className="bk-filter"><Star size={16}/><select aria-label="Filter amenities" value={onlyWifi ? 'wifi' : ''} onChange={e=>setOnlyWifi(Boolean(e.target.value))}><option value="">Amenities</option><option value="wifi">Wi-Fi</option></select></label>
      </div>
      <div className="bk-result-heading"><span>Search Result</span><span>{filtered.length} Found</span></div>
      
      {error && <div className="bk-error" role="alert">{error}<button onClick={()=>setError('')} aria-label="Dismiss"><X size={14}/></button></div>}
      {load ? <div className="bk-loading">Searching available trips…</div> : !filtered.length ? <div className="bk-loading">No trips found for your filters.</div> :
        <div className={`bk-results-layout ${active ? 'bk-results-expanded' : ''}`}>
          <div className="bk-cards">
            {filtered.map(trip=><article className={`bk-trip-card ${active===trip.id?'bk-card-active':''}`} key={trip.id}>
              <div className="bk-brand"><div className="bk-brand-mark"><img src="/assets/enacoach_logo.png" alt="ENA Coach"/></div><span>{trip.coach}</span></div>
              <div className="bk-trip-time"><small className="bk-route-chip">{trip.routeLabel}</small><strong>{trip.departureTime}</strong><span>{trip.from.toUpperCase()}</span></div>
              <div className="bk-duration"><span/>{trip.duration}<span/></div>
              <div className="bk-trip-time"><strong>{trip.arrivalTime}</strong><span>{trip.to.toUpperCase()}</span></div>
              {!active && <div className="bk-seat-availability"><b>★ 3.7</b> ({trip.seatsLeft} seats left)</div>}
              <div className="bk-price">{active ? '' : <small>Normal · Business</small>}<strong>KES {money(trip.fare)}</strong></div>
              <button className={active===trip.id?'bk-close-btn':'bk-outline-btn'} onClick={()=>chooseTrip(trip.id)}>{active===trip.id ? 'Close' : 'View Seats'}</button>
            </article>)}
          </div>
          {active && seatData && <aside className="bk-seat-panel">
            <SeatMap seats={seatData.seats} chosen={chosen} onSeat={selectSeat} limit={query.passengers}/>
            <div className="bk-seat-summary">
              <div><h3>Selected Seats</h3><p>{chosen.length ? `Seats: ${chosen.join(', ')}` : 'No seats selected'}</p>
                <small>{chosen.length ? `${chosen.length} ticket(s)` : 'Choose your seats above'}</small></div>
              <div className="bk-total"><strong>KES {money(chosen.length*seatData.trip.fare)}</strong><small>Total Amount</small></div>
            </div>
            <div className="bk-boarding-grid"><label>Boarding Point<select value={boarding} onChange={e=>setBoarding(e.target.value)}><option value="">Select a boarding point</option>{seatData.trip.boardingPoints.map(p=><option key={p}>{p}</option>)}</select></label>
              <label>Dropping Point<select value={dropping} onChange={e=>setDropping(e.target.value)}><option value="">Select a dropping point</option>{seatData.trip.droppingPoints.map(p=><option key={p}>{p}</option>)}</select></label></div>
            <button className="bk-primary" disabled={!selectionValid} onClick={proceed}>{selectionValid ? 'Proceed to Checkout  →' : `Select ${query.passengers} seat(s) and stops`}</button>
          </aside>}
          {active && !seatData && <aside className="bk-loading">Loading seat map…</aside>}
        </div>}
    </div>
  </div>;
}
