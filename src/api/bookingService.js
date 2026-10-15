import { http } from './http';

export async function searchTrips(payload) {
  // Backend integration point: POST /bookings/search
  // Return shape expected by the UI:
  // [{ id, from, to, departureTime, arrivalTime, fare, seatsLeft, className }]
  if (!import.meta.env.VITE_API_BASE_URL) {
    return mockSearchTrips(payload);
  }
  return http.post('/bookings/search', payload);
}

export async function printTicket(reference) {
  if (!import.meta.env.VITE_API_BASE_URL) {
    return { reference, status: 'FOUND', passenger: 'Demo Passenger', route: 'Nairobi - Mombasa' };
  }
  return http.get(`/tickets/${encodeURIComponent(reference)}`);
}

function mockSearchTrips(payload) {
  const base = [
    { id: 'ENA-001', departureTime: '08:00 AM', arrivalTime: '02:30 PM', fare: 1800, seatsLeft: 12, className: 'Economy' },
    { id: 'ENA-002', departureTime: '09:00 PM', arrivalTime: '05:00 AM', fare: 2200, seatsLeft: 8, className: 'VIP' },
    { id: 'ENA-003', departureTime: '10:30 PM', arrivalTime: '06:30 AM', fare: 2000, seatsLeft: 19, className: 'Standard' },
  ];
  return Promise.resolve(base.map((trip) => ({ ...trip, from: payload.from, to: payload.to })));
}
