

import { readFile } from 'node:fs/promises';
import { fetchDailyCloses } from '../src/lib/yahoo.js';
import { buildReport } from '../src/lib/report.js';

const cache = new Map();
const TTL = 10 * 60 * 1000; 

async function cachedCloses(ticker, fromDate) {
  const key = `${ticker}:${fromDate}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.data;
  const data = await fetchDailyCloses(ticker, fromDate);
  cache.set(key, { at: Date.now(), data });
  return data;
}

export default async function handler(req, res) {
  try {
    const raw = await readFile(new URL('../picks.json', import.meta.url), 'utf8');
    const report = await buildReport(JSON.parse(raw), cachedCloses);
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    res.status(200).json(report);
  } catch (err) {
    res.status(502).json({ error: String(err.message || err) });
  }
}