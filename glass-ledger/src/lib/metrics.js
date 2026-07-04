
export function latestClose(series) {
    return series[series.length - 1].close;
  }
  
  export function returnPct(entry, current) {
    return (current - entry) / entry;
  }

  export function targetProgress(entry, current, target) {
    if (target == null || current === 0) return null;
    return (target - current) / current;
  }

  export function maxDrawdown(series) {
    if (series.length === 0) return 0;
    let peak = series[0].close;
    let maxDD = 0;
    for (const { close } of series) {
      if (close > peak) peak = close;
      const dd = (close - peak) / peak;
      if (dd < maxDD) maxDD = dd;
    }
    return maxDD;
  }
  
  export function windowReturn(series) {
    if (series.length < 2) return 0;
    return returnPct(series[0].close, series[series.length - 1].close);
  }

  export function closeOnOrBefore(series, date) {
    let hit = null;
    for (const point of series) {
      if (point.date <= date) hit = point;
      else break; // series is sorted ascending
    }
    return hit ? hit.close : null;
  }

  export function benchReturn(bench, fromDate, toDate) {
    const a = closeOnOrBefore(bench, fromDate);
    const b = closeOnOrBefore(bench, toDate);
    if (a == null || b == null) return null;
    return (b - a) / a;
  }

  export function alpha(pickSeries, benchSeries) {
    if (pickSeries.length < 2) return null;
    const from = pickSeries[0].date;
    const to = pickSeries[pickSeries.length - 1].date;
    const pr = windowReturn(pickSeries);
    const br = benchReturn(benchSeries, from, to);
    if (br == null) return null;
    return pr - br;
  }

  export function computePick(pick, series, benchSeries) {
    const entry =
      pick.entry_price ?? closeOnOrBefore(series, pick.call_date) ?? series[0].close;
    const current = latestClose(series);
    return {
      ticker: pick.ticker,
      name: pick.name,
      market: pick.market, // 'IN' | 'US' -> drives currency + which index
      call_date: pick.call_date,
      entry_price: entry,
      target: pick.target,
      thesis: pick.thesis,
      current,
      return_pct: returnPct(entry, current),
      target_progress: targetProgress(entry, current, pick.target),
      max_drawdown: maxDrawdown(series),
      alpha: alpha(series, benchSeries),
      days_held: daysBetween(pick.call_date, series[series.length - 1].date),
    };
  }
  
  export function aggregate(computed) {
    const n = computed.length;
    if (n === 0) return null;
    const rets = computed.map((p) => p.return_pct);
    const alphas = computed.map((p) => p.alpha).filter((a) => a != null);
    const wins = rets.filter((r) => r > 0).length;
    const byRet = [...computed].sort((a, b) => b.return_pct - a.return_pct);
    return {
      count: n,
      win_rate: wins / n,
      avg_return: mean(rets),
      avg_alpha: alphas.length ? mean(alphas) : null,
      beat_index_rate: alphas.filter((a) => a > 0).length / (alphas.length || 1),
      worst_drawdown: Math.min(...computed.map((p) => p.max_drawdown)),
      avg_days_held: Math.round(mean(computed.map((p) => p.days_held))),
      best: byRet[0],
      worst: byRet[byRet.length - 1],
    };
  }
  
  function mean(a) {
    return a.reduce((s, x) => s + x, 0) / (a.length || 1);
  }
  function daysBetween(a, b) {
    return Math.round((new Date(b) - new Date(a)) / 86400000);
  }