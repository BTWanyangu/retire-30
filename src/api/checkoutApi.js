import { http } from './http';

export const checkoutApi = {
  search: (query) => http.post('/api/bookings/search', query),
  seats: (tripId) => http.get(`/api/trips/${encodeURIComponent(tripId)}/seats`),
  reserve: (data) => http.post('/api/bookings', data),
  config: () => http.get('/api/config'),
  status: (reference, token, refresh = false) =>
    http.get(`/api/bookings/${encodeURIComponent(reference)}?token=${encodeURIComponent(token)}${refresh ? '&refresh=true' : ''}`),
  stk: (data) => http.post('/api/payments/stk', data),
};
