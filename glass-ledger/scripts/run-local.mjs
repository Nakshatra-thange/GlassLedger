

import { readFile } from 'node:fs/promises';
import { fetchDailyCloses } from '../src/lib/yahoo.js';
import { buildReport } from '../src/lib/report.js';

const pct = (x) => (x == null ? '  —  ' : (x >= 0 ? '+' : '') + (x * 100).toFixed(1) + '%');
const cur = (m, x) => (m === 'IN' ? '₹' : '$') + x.toFixed(2);
const pad = (s, n) => String(s).padEnd(n);

const raw = await readFile(new URL('../picks.json', import.meta.url), 'utf8');
const report = await buildReport(JSON.parse(raw), fetchDailyCloses);

console.log('\n  GlassLedger — live track record  (' + report.updated_at.slice(0, 16).replace('T', ' ') + ')\n');
console.log('  ' + pad('TICKER', 15) + pad('ENTRY', 11) + pad('NOW', 11) + pad('RETURN', 9) + pad('ALPHA', 9) + pad('MAX DD', 9) + 'TARGET');
console.log('  ' + '-'.repeat(72));
for (const p of report.picks) {
  const idx = p.market === 'IN' ? 'NIFTY' : 'S&P';
  console.log(
    '  ' +
    pad(p.ticker, 15) +
    pad(cur(p.market, p.entry_price), 11) +
    pad(cur(p.market, p.current), 11) +
    pad(pct(p.return_pct), 9) +
    pad(pct(p.alpha), 9) +
    pad(pct(p.max_drawdown), 9) +
    pct(p.target_progress) + ' there'
  );
}

const s = report.summary;
console.log('\n  ' + '-'.repeat(72));
console.log(`  Win rate ${pct(s.win_rate)}   |   Avg return ${pct(s.avg_return)}   |   Avg alpha ${pct(s.avg_alpha)}   |   Beat index ${pct(s.beat_index_rate)}`);
console.log(`  Worst drawdown ${pct(s.worst_drawdown)}   |   Avg hold ${s.avg_days_held}d`);
console.log(`  Best:  ${s.best.ticker} ${pct(s.best.return_pct)}     Worst: ${s.worst.ticker} ${pct(s.worst.return_pct)}\n`);
