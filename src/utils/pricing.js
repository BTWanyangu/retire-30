// Matches the physical seat categories used by the booking API.
export const categoryForSeat = (n) => n <= 8 ? 'VIP' : n >= 37 ? 'Business' : 'Normal';
export const ticketFare = (trip, n) => {
  const fares = trip?.fares;
  if (!fares) return Number(trip?.fare || 0);
  return Number(fares[categoryForSeat(n) === 'VIP' ? 'vip' : categoryForSeat(n) === 'Business' ? 'bClass' : 'normal']);
};
export const totalFare = (trip, seats = []) => seats.reduce((sum, n) => sum + ticketFare(trip, n), 0);
