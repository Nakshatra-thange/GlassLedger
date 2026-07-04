

const BASE = 'https://query1.finance.yahoo.com/v7/finance/quote';

const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' };

export const BENCHMARK = { IN: '^NSEI', US: '^GSPC' };

export async function fetchDailyCloses(ticker) {
    const now = Math.floor(Date.now() / 1000);
    const sixMonthsAgo = now - 180 * 24 * 60 * 60;
  
    const url =
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}` +
      `?period1=${sixMonthsAgo}&period2=${now}&interval=1d&includePrePost=false`;
  
    console.log("Fetching Yahoo URL:", url);
  
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });
  
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Yahoo ${res.status} for ${ticker}\nURL: ${url}\nBody: ${body}`);
    }
  
    const data = await res.json();
  
    const result = data?.chart?.result?.[0];
    if (!result) {
      throw new Error(`No chart data returned for ${ticker}`);
    }
  
    const timestamps = result.timestamp ?? [];
    const closes = result.indicators?.quote?.[0]?.close ?? [];
  
    return timestamps
      .map((ts, i) => ({
        date: new Date(ts * 1000).toISOString().slice(0, 10),
        close: closes[i]
      }))
      .filter((row) => row.close != null);
  }