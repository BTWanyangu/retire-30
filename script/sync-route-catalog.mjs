/** Generate the backend route/price snapshot from the supplied JS route list.
 * npm/Node dependency-free. Do not manually edit server/route_catalog.json.
 * Run: node scripts/sync-route-catalog.mjs
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { RAW_ROUTES, allPlaces, routeData } from '../src/data/routePrices.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const exact = new Set(RAW_ROUTES.map(([a, b]) => [a, b].sort().join('|||')));
const routes = {};
for (const from of allPlaces) {
  routes[from] = {};
  for (const to of allPlaces) {
    if (from === to) continue;
    const item = routeData[from]?.[to];
    if (!item) throw new Error(`Missing fare ${from} -> ${to}`);
    routes[from][to] = {
      normal: item.normal, bClass: item.bClass, vip: item.vip,
      durationHrs: item.durationHrs,
      estimated: !exact.has([from, to].sort().join('|||')),
    };
  }
}
const output = {places: allPlaces, routes};
writeFileSync(resolve(root, 'server/route_catalog.json'), JSON.stringify(output) + '\n');
console.log(`Updated backend catalogue: ${allPlaces.length} places, ${Object.keys(routes).reduce((n, p) => n + Object.keys(routes[p]).length, 0)} direction-specific fares.`);
