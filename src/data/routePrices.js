/**
 * Tahmeed Express — Route Prices & Travel Times
 * All place keys normalized to UPPERCASE throughout.
 * Every pair in PLACES has a guaranteed price entry.
 */

// ── Raw anchor routes (exact prices) ─────────────────────────────────────────
// Format: [FROM, TO, normalPrice, bClassPrice, vipPrice, durationHrs]
export const RAW_ROUTES = [
  // ── NAIROBI hub ──────────────────────────────────────────────────────────
  ["NAIROBI", "MOMBASA", 1000, 1200, 1600, 8.5],
  ["NAIROBI", "MTWAPA", 1000, 1200, 1600, 9.0],
  ["NAIROBI", "MALINDI", 1200, 1600, 1800, 10.0],
  ["NAIROBI", "WATAMU", 1200, 1200, 1600, 10.5],
  ["NAIROBI", "KILIFI", 1200, 1500, 1700, 9.5],
  ["NAIROBI", "MARIAKANI", 1200, 1400, 1200, 8.0],
  ["NAIROBI", "VOI", 1000, 1200, 1000, 4.5],
  ["NAIROBI", "MTITO ANDEI", 800, 1000, 1100, 3.5],
  ["NAIROBI", "KIBWEZI", 700, 900, 1000, 2.5],
  ["NAIROBI", "MACHAKOS", 400, 500, 600, 1.5],
  ["NAIROBI", "KITUI", 700, 900, 1000, 3.0],
  ["NAIROBI", "EMBU", 700, 900, 1000, 2.5],
  ["NAIROBI", "MERU", 1000, 1200, 1400, 3.5],
  ["NAIROBI", "MAUA", 1000, 1400, 1400, 4.5],
  ["NAIROBI", "NAIVASHA", 400, 500, 600, 1.5],
  ["NAIROBI", "NAROK", 700, 900, 1000, 2.5],
  ["NAIROBI", "NAKURU", 700, 900, 1000, 2.5],
  ["NAIROBI", "KERICHO", 1200, 1400, 1400, 4.0],
  ["NAIROBI", "KISUMU", 1800, 2000, 1800, 5.5],
  ["NAIROBI", "KISII", 1600, 1800, 2000, 5.5],
  ["NAIROBI", "KAKAMEGA", 1500, 1900, 2100, 6.5],
  ["NAIROBI", "MUMIAS", 1500, 1800, 2000, 7.0],
  ["NAIROBI", "BUNGOMA", 1500, 1900, 2100, 7.0],
  ["NAIROBI", "WEBUYE", 1200, 1700, 1800, 6.5],
  ["NAIROBI", "ELDORET", 1000, 1400, 1400, 5.0],
  ["NAIROBI", "KITALE", 1000, 1600, 1800, 6.0],
  ["NAIROBI", "MALABA", 1500, 1800, 2000, 7.5],
  ["NAIROBI", "BUSIA", 1700, 2000, 1800, 7.0],
  ["NAIROBI", "TAVETA", 1200, 1700, 1800, 6.0],
  ["NAIROBI", "ARUSHA", 1800, 2600, 3000, 5.0],
  ["NAIROBI", "MOSHI", 1800, 2600, 3000, 6.5],
  ["NAIROBI", "TANGA", 3500, 4000, 4500, 11.0],
  ["NAIROBI", "DAR ES SALAAM", 3500, 4500, 5000, 16.0],
  ["NAIROBI", "KAMPALA", 3000, 3800, 4400, 12.0],

  // ── MOMBASA hub ──────────────────────────────────────────────────────────
  ["MOMBASA", "MTWAPA", 300, 400, 500, 0.5],
  ["MOMBASA", "KILIFI", 500, 700, 800, 1.0],
  ["MOMBASA", "WATAMU", 700, 900, 1000, 2.0],
  ["MOMBASA", "MALINDI", 700, 900, 1000, 2.0],
  ["MOMBASA", "MARIAKANI", 400, 500, 600, 1.0],
  ["MOMBASA", "VOI", 700, 900, 1000, 2.5],
  ["MOMBASA", "TAVETA", 800, 1000, 1200, 4.0],
  ["MOMBASA", "KITUI", 1000, 1200, 1700, 5.0],
  ["MOMBASA", "MACHAKOS", 1100, 1800, 1800, 6.5],
  ["MOMBASA", "EMBU", 1400, 1800, 1800, 8.0],
  ["MOMBASA", "MERU", 1700, 2000, 2000, 9.5],
  ["MOMBASA", "MAUA", 2000, 1800, 2600, 10.5],
  ["MOMBASA", "NAKURU", 1800, 2000, 2000, 10.0],
  ["MOMBASA", "NAIVASHA", 1800, 2000, 2000, 10.0],
  ["MOMBASA", "KERICHO", 1800, 2000, 2000, 11.5],
  ["MOMBASA", "KISUMU", 1800, 2000, 2000, 13.0],
  ["MOMBASA", "KISII", 1800, 2000, 2200, 13.5],
  ["MOMBASA", "HOMABAY", 1800, 2600, 2600, 14.5],
  ["MOMBASA", "MIGORI", 1800, 2600, 2600, 15.0],
  ["MOMBASA", "KEHANCHA", 1800, 2600, 2600, 15.5],
  ["MOMBASA", "KAKAMEGA", 1800, 2600, 2600, 15.0],
  ["MOMBASA", "MUMIAS", 1800, 2600, 2600, 15.0],
  ["MOMBASA", "ELDORET", 1700, 2000, 2000, 13.5],
  ["MOMBASA", "KITALE", 1700, 2600, 3000, 15.0],
  ["MOMBASA", "MALABA", 1700, 2600, 3000, 15.5],
  ["MOMBASA", "BUSIA", 1800, 2600, 3000, 15.0],
  ["MOMBASA", "WEBUYE", 1800, 2600, 3000, 14.5],
  ["MOMBASA", "BUNGOMA", 1800, 2600, 3000, 15.0],
  ["MOMBASA", "TANGA", 1000, 1200, 1400, 4.0],
  ["MOMBASA", "DAR ES SALAAM", 1700, 1800, 2000, 9.5],
  ["MOMBASA", "KAMPALA", 4000, 4500, 5000, 22.0],

  // ── MALINDI / KILIFI hub ──────────────────────────────────────────────────
  ["MALINDI", "KILIFI", 400, 500, 600, 1.0],
  ["MALINDI", "NAKURU", 1800, 2600, 3000, 11.5],
  ["MALINDI", "KISUMU", 3000, 3300, 3600, 14.5],
  ["MALINDI", "KITALE", 3000, 3300, 3600, 16.0],
  ["KILIFI", "NAKURU", 2000, 2400, 3000, 16.0],
  ["VOI", "KITALE", 2000, 2400, 3000, 16.0],

  // ── KISUMU hub ───────────────────────────────────────────────────────────
  ["KISUMU", "KERICHO", 700, 900, 1100, 1.5],
  ["KISUMU", "NAKURU", 1200, 1400, 1400, 3.0],
  ["KISUMU", "ELDORET", 600, 600, 800, 2.5],
  ["KISUMU", "KAKAMEGA", 500, 700, 900, 1.0],
  ["KISUMU", "MUMIAS", 600, 800, 1000, 1.5],
  ["KISUMU", "WEBUYE", 800, 1000, 1200, 2.0],
  ["KISUMU", "BUNGOMA", 800, 1000, 1200, 2.5],
  ["KISUMU", "KITALE", 1000, 1200, 1400, 3.0],
  ["KISUMU", "MALABA", 1000, 1200, 1400, 2.5],
  ["KISUMU", "BUSIA", 800, 1000, 1200, 2.0],

  // ── ARUSHA / TANZANIA internal ────────────────────────────────────────────
  ["ARUSHA", "MOSHI", 500, 700, 900, 1.5],
  ["ARUSHA", "TANGA", 1200, 1800, 1800, 5.0],
  ["ARUSHA", "DAR ES SALAAM", 1800, 2300, 2600, 8.0],
  ["MOSHI", "DAR ES SALAAM", 1800, 2300, 2600, 8.5],
  ["TANGA", "DAR ES SALAAM", 1000, 1200, 1400, 5.0],

  // ── WESTERN KENYA internal ────────────────────────────────────────────────
  ["KITALE", "ELDORET", 500, 700, 900, 1.5],
  ["KITALE", "WEBUYE", 400, 600, 800, 1.0],
  ["KITALE", "BUNGOMA", 400, 600, 800, 1.0],
  ["KITALE", "KAKAMEGA", 700, 900, 1100, 2.0],
  ["KITALE", "MALABA", 500, 700, 900, 1.5],
  ["BUNGOMA", "MUMIAS", 300, 500, 700, 0.75],
  ["BUNGOMA", "BUSIA", 400, 600, 800, 1.0],
  ["BUNGOMA", "MALABA", 500, 700, 900, 1.0],
  ["NAKURU", "KERICHO", 700, 900, 1100, 1.5],
  ["NAKURU", "ELDORET", 700, 900, 1100, 2.0],
  ["ELDORET", "WEBUYE", 500, 700, 900, 1.0],
  ["ELDORET", "MALABA", 700, 900, 1100, 2.0],
];

// ── All places served ─────────────────────────────────────────────────────────
const PLACES = [
  "AIRTEL TOTAL",
  "AKALA",
  "ALLSOPS",
  "ARUSHA",
  "AWENDO",
  "BAMBURI",
  "BIRONGO",
  "BOMET",
  "BONDO",
  "BUMALA",
  "BUNGOMA",
  "BUSEGA",
  "BUSIA",
  "CHAKA",
  "CHANGAMWE",
  "CHAVAKALI",
  "CHEPILAT",
  "CHWELE",
  "DAR ES SALAAM",
  "ELDORET",
  "EMALI",
  "EMBU",
  "GILGIL",
  "HOMABAY",
  "ISIOLO",
  "JINJA",
  "JUJA",
  "KADEL",
  "KADONGO",
  "KAGIO",
  "KAKAMEGA",
  "KAMPALA",
  "KAPLONG",
  "KAPSABET",
  "KARATINA",
  "KATITO",
  "KEHANCHA",
  "KENDUBAY",
  "KENOL",
  "KERICHO",
  "KEROKA",
  "KERUGOYA",
  "KEUMBU",
  "KIBWEZI",
  "KIJAURI",
  "KILIFI",
  "KIMILILI",
  "KISII",
  "KISUMU",
  "KITALE",
  "KITUI",
  "KOLWENY",
  "KUTUS",
  "LUANDA",
  "LUANDA KENYA",
  "LWAKHAKHA",
  "MACHAKOS",
  "MACHAKOS JUNCTION",
  "MAKONGENI",
  "MALABA",
  "MALILI",
  "MALINDI",
  "MARAGUA",
  "MARIAKANI",
  "MATUNDA",
  "MAUA",
  "MAVUENI",
  "MAWEGO",
  "MERU",
  "MIGORI",
  "MIRITINI",
  "MLOLONGO",
  "MOIS BRIDGE",
  "MOMBASA",
  "MOSHI",
  "MTITO ANDEI",
  "MTWAPA",
  "MUMIAS",
  "MURANGA",
  "MWEMBE TAYARI",
  "NAIROBI",
  "NAIROBI AIRTEL",
  "NAIVASHA",
  "NAKURU",
  "NAMBALE",
  "NANYUKI",
  "NAROK",
  "NARUMORO",
  "NDORI",
  "NTIMARU",
  "NYACHENGE",
  "NYADORERA",
  "NYALI",
  "NYERI",
  "ORIRI",
  "OYUGIS",
  "PORT VICTORIA",
  "RAMBA",
  "RANEN",
  "RODI",
  "RODI KOPANY",
  "RODI-KOPANY",
  "RONGO",
  "RUAI",
  "RUIRU",
  "SABA SABA",
  "SABATIA",
  "SHANZU",
  "SIAYA",
  "SONDU",
  "SOTIK",
  "SUNEKA",
  "TANGA",
  "TAVETA",
  "THIKA",
  "UBUNGO",
  "UGUNJA",
  "UTAWALA",
  "VOI",
  "WATAMU",
  "WEBUYE",
  "YALA KENYA",
];

// ── Geographic coordinates for distance calculation ───────────────────────────
const COORDINATES = {
  NAIROBI: { lat: -1.2921, lng: 36.8219 },
  "NAIROBI AIRTEL": { lat: -1.2921, lng: 36.8219 },
  "AIRTEL TOTAL": { lat: -1.2921, lng: 36.8219 },
  MOMBASA: { lat: -4.0435, lng: 39.6682 },
  "MWEMBE TAYARI": { lat: -4.0435, lng: 39.6682 },
  CHANGAMWE: { lat: -4.0435, lng: 39.6682 },
  MIRITINI: { lat: -4.0435, lng: 39.6682 },
  KISUMU: { lat: -0.1022, lng: 34.7617 },
  NAKURU: { lat: -0.3031, lng: 36.08 },
  ELDORET: { lat: 0.5143, lng: 35.2698 },
  KAMPALA: { lat: 0.3476, lng: 32.5825 },
  "DAR ES SALAAM": { lat: -6.7924, lng: 39.2083 },
  UBUNGO: { lat: -6.7924, lng: 39.2083 },
  ARUSHA: { lat: -3.3869, lng: 36.683 },
  MOSHI: { lat: -3.3439, lng: 37.3404 },
  TANGA: { lat: -5.0889, lng: 39.1023 },
  MALINDI: { lat: -3.2192, lng: 40.1169 },
  KITALE: { lat: 1.0191, lng: 35.0023 },
  KAKAMEGA: { lat: 0.2827, lng: 34.7519 },
  BUNGOMA: { lat: 0.5695, lng: 34.5584 },
  WEBUYE: { lat: 0.6167, lng: 34.7667 },
  KERICHO: { lat: -0.3689, lng: 35.2863 },
  MERU: { lat: 0.0515, lng: 37.6456 },
  MAUA: { lat: 0.2333, lng: 37.9333 },
  EMBU: { lat: -0.5388, lng: 37.4596 },
  MACHAKOS: { lat: -1.5177, lng: 37.2634 },
  "MACHAKOS JUNCTION": { lat: -1.5177, lng: 37.2634 },
  KITUI: { lat: -1.3667, lng: 38.0167 },
  VOI: { lat: -3.3967, lng: 38.555 },
  "MTITO ANDEI": { lat: -2.6833, lng: 38.1667 },
  KIBWEZI: { lat: -2.4167, lng: 37.9667 },
  MARIAKANI: { lat: -3.85, lng: 39.4667 },
  KILIFI: { lat: -3.6333, lng: 39.85 },
  WATAMU: { lat: -3.35, lng: 40.0167 },
  MTWAPA: { lat: -3.95, lng: 39.7333 },
  BAMBURI: { lat: -4.0, lng: 39.7167 },
  NYALI: { lat: -4.05, lng: 39.6833 },
  SHANZU: { lat: -3.9833, lng: 39.7167 },
  NAROK: { lat: -1.0833, lng: 35.8667 },
  NAIVASHA: { lat: -0.7167, lng: 36.4333 },
  GILGIL: { lat: -0.5, lng: 36.3167 },
  KISII: { lat: -0.6817, lng: 34.7667 },
  HOMABAY: { lat: -0.5333, lng: 34.45 },
  MIGORI: { lat: -1.0667, lng: 34.4667 },
  KEHANCHA: { lat: -1.0833, lng: 34.5667 },
  BUSIA: { lat: 0.4667, lng: 34.0833 },
  MALABA: { lat: 0.6333, lng: 34.2833 },
  BUMALA: { lat: 0.5, lng: 34.1 },
  "PORT VICTORIA": { lat: 0.1, lng: 33.9833 },
  ISIOLO: { lat: 0.35, lng: 37.5833 },
  NANYUKI: { lat: 0.0167, lng: 37.0667 },
  NARUMORO: { lat: -0.2, lng: 37.0167 },
  NYERI: { lat: -0.4167, lng: 36.95 },
  KARATINA: { lat: -0.4833, lng: 37.1167 },
  THIKA: { lat: -1.0333, lng: 37.0833 },
  JUJA: { lat: -1.1, lng: 37.0167 },
  RUIRU: { lat: -1.15, lng: 36.9667 },
  RUAI: { lat: -1.3167, lng: 36.9833 },
  MLOLONGO: { lat: -1.3833, lng: 36.9333 },
  UTAWALA: { lat: -1.3167, lng: 36.8833 },
  SIAYA: { lat: 0.0667, lng: 34.2833 },
  BONDO: { lat: -0.1, lng: 34.2667 },
  BOMET: { lat: -0.7833, lng: 35.35 },
  SOTIK: { lat: -0.6833, lng: 35.1167 },
  KAPLONG: { lat: -0.5, lng: 35.1833 },
  CHEPILAT: { lat: -0.6333, lng: 35.15 },
  KAPSABET: { lat: 0.2, lng: 35.1 },
  "MOIS BRIDGE": { lat: 0.3, lng: 35.1167 },
  MUMIAS: { lat: 0.3333, lng: 34.4833 },
  LUANDA: { lat: 0.2833, lng: 34.0667 },
  "LUANDA KENYA": { lat: 0.2833, lng: 34.0667 },
  NAMBALE: { lat: 0.4333, lng: 34.25 },
  KIMILILI: { lat: 0.7833, lng: 34.7167 },
  CHWELE: { lat: 0.8, lng: 34.5833 },
  SABATIA: { lat: 0.0333, lng: 34.75 },
  MALILI: { lat: -2.0, lng: 37.5 },
  MAKONGENI: { lat: -3.4, lng: 38.55 },
  TAVETA: { lat: -3.4, lng: 37.6833 },
  MURANGA: { lat: -0.7167, lng: 37.15 },
  MARAGUA: { lat: -0.7833, lng: 37.1333 },
  KENOL: { lat: -1.0167, lng: 37.1167 },
  "SABA SABA": { lat: -1.05, lng: 37.0833 },
  KERUGOYA: { lat: -0.5, lng: 37.2833 },
  KAGIO: { lat: -0.5167, lng: 37.2833 },
  KUTUS: { lat: -0.5333, lng: 37.3167 },
  NDORI: { lat: -1.05, lng: 36.7 },
  KATITO: { lat: -1.35, lng: 36.7833 },
  EMALI: { lat: -2.0833, lng: 37.4667 },
  MAVUENI: { lat: -3.1, lng: 38.3667 },
  KIJAURI: { lat: -0.8, lng: 36.7167 },
  ALLSOPS: { lat: -0.3167, lng: 36.0667 },
  RANEN: { lat: -0.8333, lng: 34.5167 },
  RODI: { lat: -0.9, lng: 34.45 },
  "RODI KOPANY": { lat: -0.9, lng: 34.45 },
  "RODI-KOPANY": { lat: -0.9, lng: 34.45 },
  RONGO: { lat: -0.75, lng: 34.6 },
  AWENDO: { lat: -0.8833, lng: 34.5833 },
  OYUGIS: { lat: -0.5, lng: 34.7333 },
  ORIRI: { lat: -1.5833, lng: 34.8333 },
  KEUMBU: { lat: -0.5833, lng: 34.9 },
  SUNEKA: { lat: -0.65, lng: 34.7167 },
  NYACHENGE: { lat: -0.5167, lng: 34.7167 },
  NYADORERA: { lat: -0.7833, lng: 34.4833 },
  KENDUBAY: { lat: -0.35, lng: 34.65 },
  UGUNJA: { lat: 0.0167, lng: 34.3 },
  "YALA KENYA": { lat: 0.0833, lng: 34.5333 },
  KADEL: { lat: 0.05, lng: 34.7 },
  AKALA: { lat: -0.0167, lng: 34.5833 },
  LWAKHAKHA: { lat: 0.7667, lng: 34.3833 },
  MATUNDA: { lat: 0.5833, lng: 34.8667 },
  CHAVAKALI: { lat: 0.3833, lng: 34.7833 },
  RAMBA: { lat: -0.25, lng: 34.55 },
  SONDU: { lat: -0.3333, lng: 35.0167 },
  CHAKA: { lat: -0.4833, lng: 37.2 },
  KOLWENY: { lat: -1.4333, lng: 35.85 },
  JINJA: { lat: 0.4333, lng: 33.2 },
  BIRONGO: { lat: -0.6833, lng: 34.7667 },
  BUSEGA: { lat: 0.2333, lng: 34.25 },
  KEROKA: { lat: -0.6833, lng: 34.8333 },
  MAWEGO: { lat: -0.5833, lng: 34.8 },
  KADONGO: { lat: 0.0333, lng: 34.0833 },
  NTIMARU: { lat: -0.8333, lng: 34.5167 },
};

// ── Haversine distance (km) ───────────────────────────────────────────────────
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getCoords(place) {
  return COORDINATES[place] ?? null;
}

// ── Build lookup map from exact anchor routes ─────────────────────────────────
// Keys are "PLACE_A|||PLACE_B" (both uppercase, A < B alphabetically)
const anchorMap = new Map();

RAW_ROUTES.forEach(([from, to, normal, bClass, vip, durationHrs]) => {
  const [a, b] = [from, to].sort();
  anchorMap.set(`${a}|||${b}`, { normal, bClass, vip, durationHrs });
});

// Pre-compute anchor route distances for interpolation
const anchorWithDist = [];
for (const [key, data] of anchorMap.entries()) {
  const [a, b] = key.split("|||");
  const ca = getCoords(a);
  const cb = getCoords(b);
  if (ca && cb) {
    const dist = haversine(ca.lat, ca.lng, cb.lat, cb.lng);
    anchorWithDist.push({ dist, ...data });
  }
}
anchorWithDist.sort((a, b) => a.dist - b.dist);

// ── Price interpolation for unknown routes ────────────────────────────────────
function interpolate(from, to) {
  const ca = getCoords(from);
  const cb = getCoords(to);

  let dist;
  if (ca && cb) {
    dist = haversine(ca.lat, ca.lng, cb.lat, cb.lng);
  } else {
    // Fallback if somehow coordinates are missing
    dist = 200;
  }

  // Weighted average of 5 nearest anchors by distance similarity
  const ranked = anchorWithDist
    .map((r) => ({ ...r, diff: Math.abs(r.dist - dist) }))
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 5);

  if (ranked.length === 0) {
    const base = Math.max(Math.round((dist * 3.5) / 100) * 100, 300);
    return {
      normal: base,
      bClass: Math.max(Math.round((base * 1.2) / 100) * 100, 400),
      vip: Math.max(Math.round((base * 1.4) / 100) * 100, 500),
      durationHrs: Math.max(Math.round((dist / 55) * 2) / 2, 0.5),
    };
  }

  const totalW = ranked.reduce((s, r) => s + 1 / (r.diff + 1), 0);
  const w = (field) =>
    ranked.reduce((s, r) => s + r[field] * (1 / (r.diff + 1)), 0) / totalW;

  return {
    normal: Math.max(Math.round(w("normal") / 100) * 100, 300),
    bClass: Math.max(Math.round(w("bClass") / 100) * 100, 400),
    vip: Math.max(Math.round(w("vip") / 100) * 100, 500),
    durationHrs: Math.max(Math.round(w("durationHrs") * 2) / 2, 0.5),
  };
}

// ── Build full routeData — ALL UPPERCASE keys ─────────────────────────────────
export const routeData = {};

function addRoute(from, to, normal, bClass, vip, durationHrs) {
  const entry = { normal, bClass, vip, durationHrs };
  if (!routeData[from]) routeData[from] = {};
  if (!routeData[to]) routeData[to] = {};
  routeData[from][to] = entry;
  routeData[to][from] = entry;
}

// Step 1 — seed with exact anchor prices
RAW_ROUTES.forEach(([from, to, normal, bClass, vip, durationHrs]) =>
  addRoute(from, to, normal, bClass, vip, durationHrs)
);

// Step 2 — fill every remaining pair in PLACES using interpolation
for (let i = 0; i < PLACES.length; i++) {
  for (let j = i + 1; j < PLACES.length; j++) {
    const from = PLACES[i];
    const to = PLACES[j];
    if (routeData[from]?.[to]) continue; // exact anchor already set
    const est = interpolate(from, to);
    addRoute(from, to, est.normal, est.bClass, est.vip, est.durationHrs);
  }
}

// ── Route Tier Categorization ─────────────────────────────────────────────────
const TIER_1_SET = new Set([
  "NAIROBI|||MOMBASA",
  "NAIROBI|||KISUMU",
  "NAIROBI|||NAKURU",
  "NAIROBI|||ELDORET",
  "NAIROBI|||KAMPALA",
  "MOMBASA|||DAR ES SALAAM",
  "MOMBASA|||TANGA",
  "KISUMU|||NAIROBI",
  "KISUMU|||KAKAMEGA",
]);

const TIER_2_SET = new Set([
  "NAIROBI|||MALINDI",
  "NAIROBI|||KILIFI",
  "NAIROBI|||MACHAKOS",
  "NAIROBI|||EMBU",
  "NAIROBI|||MERU",
  "NAIROBI|||ARUSHA",
  "NAIROBI|||MOSHI",
  "NAIROBI|||NAIVASHA",
  "NAIROBI|||NAROK",
  "NAIROBI|||KERICHO",
  "NAIROBI|||KAKAMEGA",
  "NAIROBI|||KITALE",
  "NAIROBI|||BUSIA",
  "MOMBASA|||MALINDI",
  "MOMBASA|||KILIFI",
  "MOMBASA|||VOI",
  "MOMBASA|||MACHAKOS",
  "MOMBASA|||NAKURU",
  "MOMBASA|||KISUMU",
  "KISUMU|||NAKURU",
  "KISUMU|||ELDORET",
  "KISUMU|||KERICHO",
  "KISUMU|||KITALE",
  "KISUMU|||BUSIA",
  "NAKURU|||ELDORET",
  "NAKURU|||KERICHO",
  "KISUMU|||BUNGOMA",
  "KISUMU|||WEBUYE",
  "KISUMU|||MUMIAS",
  "KISUMU|||MALABA",
  "ELDORET|||KITALE",
  "ELDORET|||WEBUYE",
  "ELDORET|||MALABA",
]);

export function getRouteTier(from, to) {
  const a = from.toUpperCase();
  const b = to.toUpperCase();
  const key = `${a}|||${b}`;
  const revKey = `${b}|||${a}`;
  if (TIER_1_SET.has(key) || TIER_1_SET.has(revKey)) return 1;
  if (TIER_2_SET.has(key) || TIER_2_SET.has(revKey)) return 2;
  return 3;
}

// ── Public helpers ────────────────────────────────────────────────────────────
export function getPrice(from, to, seatClass = "normal") {
  return routeData[from]?.[to]?.[seatClass] ?? null;
}

export function getAllPrices(from, to) {
  const r = routeData[from]?.[to];
  if (!r) return null;
  return { normal: r.normal, bClass: r.bClass, vip: r.vip };
}

export function getDuration(from, to) {
  return routeData[from]?.[to]?.durationHrs ?? null;
}

export function formatDuration(hrs) {
  if (hrs == null) return "N/A";
  const h = Math.floor(hrs);
  const m = Math.round((hrs - h) * 60);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function getRouteInfo(from, to) {
  const r = routeData[from]?.[to];
  if (!r) return null;
  return { ...r, durationLabel: formatDuration(r.durationHrs) };
}

export function getDestinations(from) {
  return Object.keys(routeData[from] ?? {});
}

export const allPlaces = [...PLACES].sort();

export const CLASS_LABELS = {
  normal: "Normal",
  bClass: "Business",
  vip: "VIP",
};

// Legacy aliases
export const routePrices = routeData;
export default routeData;
