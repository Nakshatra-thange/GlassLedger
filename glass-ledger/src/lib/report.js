

import { BENCHMARK } from './yahoo.js';
import { computePick, aggregate } from './metrics.js';

/**
 * @param picks       array from picks.json
 * @param fetchCloses async (ticker, fromDate) => [{date, close}]
 */
export async function buildReport(picks, fetchCloses) {

  const earliest = {};
  for (const p of picks) {
    if (!earliest[p.market] || p.call_date < earliest[p.market]) {
      earliest[p.market] = p.call_date;
    }
  }

  const benches = {};
  for (const [market, from] of Object.entries(earliest)) {
    benches[market] = await fetchCloses(BENCHMARK[market], from);
  }

  const computed = [];
  for (const p of picks) {
    const series = await fetchCloses(p.ticker, p.call_date);
    computed.push(computePick(p, series, benches[p.market]));
  }

  return {
    updated_at: new Date().toISOString(),
    picks: computed,
    summary: aggregate(computed),
  };
}