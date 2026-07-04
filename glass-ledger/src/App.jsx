import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Moon, Sparkles, Trophy, Activity, TrendingUp, AlertTriangle } from "lucide-react";

const SAMPLE = {
  updated_at: new Date().toISOString(),
  picks: [
    { ticker: "RELIANCE.NS", name: "Reliance Industries", market: "IN", call_date: "2025-02-10", entry_price: 1248.4, current: 1476.0, target: 1450, return_pct: 0.1823, target_progress: 1.128, max_drawdown: -0.121, alpha: 0.061, days_held: 509, thesis: "Retail + Jio monetization; refining margins recovering.", spark: g(1248, 1476, -0.12) },
    { ticker: "ICICIBANK.NS", name: "ICICI Bank", market: "IN", call_date: "2025-02-17", entry_price: 1244.0, current: 1518.0, target: 1500, return_pct: 0.2203, target_progress: 1.070, max_drawdown: -0.082, alpha: 0.108, days_held: 502, thesis: "Best-in-class ROA; clean book, credit-cycle winner.", spark: g(1244, 1518, -0.08) },
    { ticker: "HDFCBANK.NS", name: "HDFC Bank", market: "IN", call_date: "2025-03-10", entry_price: 1702.0, current: 2044.0, target: 2000, return_pct: 0.2009, target_progress: 1.148, max_drawdown: -0.091, alpha: 0.087, days_held: 481, thesis: "Post-merger deposit ramp; re-rating on stable NIMs.", spark: g(1702, 2044, -0.09) },
    { ticker: "TCS.NS", name: "Tata Consultancy", market: "IN", call_date: "2025-02-24", entry_price: 4038.0, current: 3602.0, target: 4600, return_pct: -0.1080, target_progress: -0.775, max_drawdown: -0.224, alpha: -0.142, days_held: 495, thesis: "Deal pipeline strong; INR tailwind on exports.", spark: g(4038, 3602, -0.22) },
    { ticker: "NVDA", name: "NVIDIA", market: "US", call_date: "2025-02-10", entry_price: 129.9, current: 184.6, target: 160, return_pct: 0.4211, target_progress: 1.820, max_drawdown: -0.301, alpha: 0.247, days_held: 509, thesis: "Data-center demand; Blackwell ramp underappreciated.", spark: g(129.9, 184.6, -0.30) },
    { ticker: "MSFT", name: "Microsoft", market: "US", call_date: "2025-03-03", entry_price: 409.6, current: 499.2, target: 470, return_pct: 0.2188, target_progress: 1.483, max_drawdown: -0.163, alpha: 0.079, days_held: 488, thesis: "Copilot attach + Azure reacceleration.", spark: g(409.6, 499.2, -0.16) },
    { ticker: "AAPL", name: "Apple", market: "US", call_date: "2025-02-18", entry_price: 241.8, current: 227.4, target: 275, return_pct: -0.0595, target_progress: -0.433, max_drawdown: -0.221, alpha: -0.178, days_held: 501, thesis: "Services margin story; softer near-term iPhone.", spark: g(241.8, 227.4, -0.22) },
    { ticker: "TSLA", name: "Tesla", market: "US", call_date: "2025-03-10", entry_price: 350.7, current: 410.1, target: 420, return_pct: 0.1694, target_progress: 0.858, max_drawdown: -0.352, alpha: 0.021, days_held: 481, thesis: "Contrarian call into weakness; energy + FSD optionality.", spark: g(350.7, 410.1, -0.35) },
  ],
};

function g(a, b, dipFrac) {
  const n = 24, out = [], dipAt = 9, trough = a * (1 + dipFrac);
  for (let i = 0; i < n; i++) {
    let v = i <= dipAt
      ? a + (trough - a) * (i / dipAt)
      : trough + (b - trough) * ((i - dipAt) / (n - 1 - dipAt));
    v *= 1 + Math.sin(i * 1.7) * 0.01;
    out.push(+v.toFixed(2));
  }
  return out;
}

const money = (m, x) =>
  (m === "IN" ? "₹" : "$") +
  x.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const pct = (x, s = true) =>
  x == null ? "—" : (s && x > 0 ? "+" : "") + (x * 100).toFixed(1) + "%";

function starLayer(count, tile, minS, maxS, minO, maxO) {
  const p = [];
  for (let i = 0; i < count; i++) {
    const x = (Math.random() * tile).toFixed(0),
      y = (Math.random() * tile).toFixed(0);
    const s = (minS + Math.random() * (maxS - minS)).toFixed(1);
    const o = (minO + Math.random() * (maxO - minO)).toFixed(2);
    p.push(
      `radial-gradient(${s}px ${s}px at ${x}px ${y}px, rgba(255,255,255,${o}) 50%, transparent)`
    );
  }
  return { backgroundImage: p.join(","), backgroundSize: `${tile}px ${tile}px` };
}

function Sparkline({ data, up }) {
  if (!data || data.length < 2) return null;
  const w = 132,
    h = 34,
    min = Math.min(...data),
    max = Math.max(...data),
    rng = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / rng) * (h - 4) - 2,
  ]);
  const d = pts
    .map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1))
    .join(" ");
  const id = "g" + (up ? "u" : "d") + Math.round(data[0]);
  const c = up ? "var(--pos)" : "var(--neg)";
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity="0.30" />
          <stop offset="100%" stopColor={c} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={d + ` L${w} ${h} L0 ${h} Z`} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TargetBar({ progress }) {
  const under = progress < 0;
  const fill = Math.max(0, Math.min(1, progress));
  return (
    <div className="tgt">
      <div className="tgt-track">
        <div
          className={"tgt-fill" + (under ? " under" : "")}
          style={{ width: (under ? 6 : fill * 100) + "%" }}
        />
      </div>
      <span className="tgt-label">
        {under ? "against thesis" : Math.round(fill * 100) + "% to target"}
      </span>
    </div>
  );
}

function PickCard({ p }) {
  if (p.error)
    return (
      <div className="card pick err">
        <div className="pick-top">
          <span className="tk">{p.ticker}</span>
          <span className="badge">{p.market}</span>
        </div>
        <div className="err-body">
          <AlertTriangle size={16} />
          <span>Data unavailable</span>
        </div>
        <div className="thesis">{p.name}</div>
      </div>
    );

  const up = p.return_pct >= 0;

  return (
    <div className="card pick">
      <div className="pick-top">
        <div>
          <span className="tk">{p.ticker}</span>
          <div className="name">{p.name}</div>
        </div>
        <span className="badge">
          {p.market === "IN" ? "🇮🇳 NSE" : "🇺🇸 US"}
        </span>
      </div>

      <div className="pick-mid">
        <div className={"ret " + (up ? "pos" : "neg")}>{pct(p.return_pct)}</div>
        <Sparkline data={p.spark} up={up} />
      </div>

      <div className="rows">
        <div><span>Entry</span><b className="mono">{money(p.market, p.entry_price)}</b></div>
        <div><span>Now</span><b className="mono">{money(p.market, p.current)}</b></div>
        <div><span>vs {p.market === "IN" ? "NIFTY" : "S&P"}</span><b className={p.alpha >= 0 ? "pos" : "neg"}>{pct(p.alpha)}</b></div>
        <div><span>Max dip</span><b className="neg">{pct(p.max_drawdown, false)}</b></div>
      </div>

      <TargetBar progress={p.target_progress} />
      {p.thesis && <div className="thesis">{p.thesis}</div>}
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState("midnight");
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [data, setData] = useState(null);
  const [live, setLive] = useState(false);
  const hasData = useRef(false);

  const far = useMemo(() => starLayer(70, 340, 0.6, 1.3, 0.35, 0.85), []);
  const near = useMemo(() => starLayer(26, 560, 1, 2.1, 0.6, 1), []);

  useEffect(() => {
    let on = true;
    const load = () =>
      fetch("/api/metrics")
        .then((r) => {
          if (!r.ok) throw 0;
          return r.json();
        })
        .then((d) => {
          if (on) {
            setData(d);
            setLive(true);
            hasData.current = true;
          }
        })
        .catch(() => {
          if (on && !hasData.current) setData(SAMPLE);
        });

    load();
    const t = setInterval(load, 300000);
    return () => {
      on = false;
      clearInterval(t);
    };
  }, []);

  const picks = data?.picks || [];
  const valid = picks.filter((p) => !p.error);

  const summary = useMemo(() => {
    if (!valid.length) return null;
    const r = valid.map((p) => p.return_pct);
    const a = valid.map((p) => p.alpha).filter((x) => x != null);
    const mean = (arr) => arr.reduce((s, x) => s + x, 0) / (arr.length || 1);
    return {
      avg_return: mean(r),
      win_rate: r.filter((x) => x > 0).length / r.length,
      avg_alpha: mean(a),
      beat: a.filter((x) => x > 0).length,
      beat_of: a.length,
      worst_dd: Math.min(...valid.map((p) => p.max_drawdown)),
    };
  }, [data]);

  const shown = picks.filter((p) => {
    const s = q.trim().toLowerCase();
    if (s && !(p.ticker.toLowerCase().includes(s) || (p.name || "").toLowerCase().includes(s))) return false;
    if (filter === "win") return !p.error && p.return_pct > 0;
    if (filter === "lose") return !p.error && p.return_pct <= 0;
    if (filter === "in") return p.market === "IN";
    if (filter === "us") return p.market === "US";
    return true;
  });

  const updated = data ? new Date(data.updated_at) : null;
  const tabs = [["all", "All"], ["win", "Winners"], ["lose", "Losers"], ["in", "India"], ["us", "US"]];

  return (
    <div className="gl" data-theme={theme}>
      <style>{CSS}</style>

      <div className="ambient">
        <div className="stars" style={far} />
        <div className="stars twinkle" style={near} />
        <div className="nebula" />
        <svg className="mtn" viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden="true">
          <polygon className="mtn-far" points="0,320 0,210 240,120 470,205 700,110 960,215 1180,140 1440,225 1440,320" />
          <polygon className="mtn-near" points="0,320 0,260 300,175 560,255 830,165 1090,255 1310,195 1440,250 1440,320" />
        </svg>
      </div>

      <header className="card bar">
        <div className="brand">
          <div className="logo">GL</div>
          <div className="brand-copy">
            <div className="btitle">GlassLedger</div>
            <div className="bsub">public track record</div>
          </div>
        </div>

        <label className="search">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ticker"
            aria-label="Search ticker"
          />
        </label>

        <div className="bar-right">
          <span className="stamp">
            <i className={"dot" + (live ? " on" : "")} />
            {live ? "live · 15-min delayed" : "sample"}
            {updated
              ? " · " +
                updated.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </span>

          <div className="seg">
            <button
              className={theme === "midnight" ? "act" : ""}
              onClick={() => setTheme("midnight")}
              aria-label="Midnight"
            >
              <Moon size={15} />
            </button>
            <button
              className={theme === "nebula" ? "act" : ""}
              onClick={() => setTheme("nebula")}
              aria-label="Nebula"
            >
              <Sparkles size={15} />
            </button>
          </div>
        </div>
      </header>

      <main className="grid">
        {summary && (
          <>
            <div className="card metric">
              <div className="m-label"><Activity size={15} /> Avg return</div>
              <div className={"m-num " + (summary.avg_return >= 0 ? "pos" : "neg")}>{pct(summary.avg_return)}</div>
              <div className="m-foot">across {valid.length} live calls</div>
            </div>

            <div className="card metric">
              <div className="m-label"><Trophy size={15} /> Win rate</div>
              <div className="m-num">{Math.round(summary.win_rate * 100)}%</div>
              <div className="m-foot">
                {valid.filter((p) => p.return_pct > 0).length} up, {valid.filter((p) => p.return_pct <= 0).length} down — shown honestly
              </div>
            </div>

            <div className="card metric hero">
              <div className="m-label"><TrendingUp size={16} /> Alpha vs index</div>
              <div className={"m-num big " + (summary.avg_alpha >= 0 ? "pos" : "neg")}>{pct(summary.avg_alpha)}</div>
              <div className="m-foot">
                beat the benchmark <b>{summary.beat} of {summary.beat_of}</b> times · the number that matters
              </div>
            </div>

            <div className="card metric">
              <div className="m-label"><AlertTriangle size={15} /> Max drawdown</div>
              <div className="m-num neg">{pct(summary.worst_dd, false)}</div>
              <div className="m-foot">deepest dip any single call took</div>
            </div>
          </>
        )}
      </main>

      <section className="picks">
        {shown.length ? (
          shown.map((p) => <PickCard key={p.ticker} p={p} />)
        ) : (
          <div className="empty">
            No calls match “{q}”. Clear the search to see the full record.
          </div>
        )}
      </section>

      <div className="method">
        Entries are the adjusted close on each call date · benchmarks are NIFTY 50 / S&amp;P 500 · losers are never hidden
        {live ? "" : " · sample data — run vercel dev for live"}
      </div>

      <nav className="card tabs" role="tablist">
        {tabs.map(([k, l]) => (
          <button
            key={k}
            role="tab"
            aria-selected={filter === k}
            className={filter === k ? "act" : ""}
            onClick={() => setFilter(k)}
          >
            {l}
          </button>
        ))}
      </nav>
    </div>
  );
}

const CSS = `
.gl{
  --pos:#41dd94;
  --neg:#ff7a63;
  position:relative;
  min-height:100vh;
  padding:28px 24px 108px;
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter",system-ui,sans-serif;
  --txt:#f3f6ff;
  --txt2:rgba(206,216,255,.62);
  --glass:rgba(255,255,255,.085);
  --stroke:rgba(255,255,255,.30);
  --shadow:0 10px 44px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.4),inset 0 0 0 1px rgba(255,255,255,.03);
  --sky-top:#050815;
  --sky-bot:#0a1330;
  --neb:rgba(70,110,220,.5);
  --neb2:rgba(60,180,190,.28);
  color:var(--txt);
  -webkit-font-smoothing:antialiased;
}

.gl[data-theme=nebula]{
  --sky-top:#0a0518;
  --sky-bot:#180b2c;
  --neb:rgba(150,70,200,.5);
  --neb2:rgba(210,80,150,.3);
  --pos:#4fe0a0;
  --neg:#ff8a72;
}

.mono{
  font-family:"SF Mono",ui-monospace,"JetBrains Mono",Menlo,monospace;
  font-variant-numeric:tabular-nums;
}

.pos{color:var(--pos)}
.neg{color:var(--neg)}

.ambient{
  position:fixed;
  inset:0;
  z-index:-1;
  overflow:hidden;
  background:linear-gradient(180deg,var(--sky-top) 0%,var(--sky-bot) 68%,#05070f 100%);
}

.stars{
  position:absolute;
  inset:-20px;
  background-repeat:repeat;
}

.twinkle{animation:tw 5.5s ease-in-out infinite;}
@keyframes tw{0%,100%{opacity:.55}50%{opacity:1}}

.nebula{
  position:absolute;
  inset:0;
  background:
    radial-gradient(38% 30% at 22% 18%,var(--neb),transparent 70%),
    radial-gradient(32% 26% at 82% 26%,var(--neb2),transparent 70%);
  filter:blur(20px);
  opacity:.85;
}

.mtn{
  position:absolute;
  bottom:0;
  left:0;
  width:100%;
  height:44vh;
  min-height:220px;
}

.mtn-far{fill:#0a1020;opacity:.85;}
.mtn-near{fill:#05070f;}
.gl[data-theme=nebula] .mtn-far{fill:#140a24;}
.gl[data-theme=nebula] .mtn-near{fill:#07040d;}

.card{
  background:var(--glass);
  border:1px solid var(--stroke);
  border-radius:26px;
  box-shadow:var(--shadow);
  backdrop-filter:blur(40px) saturate(150%);
  -webkit-backdrop-filter:blur(40px) saturate(150%);
}

.bar{
  display:flex;
  align-items:center;
  gap:20px;
  padding:16px 18px;
  max-width:1140px;
  margin:0 auto 24px;
}

.brand{
  display:flex;
  align-items:center;
  gap:14px;
  min-width:0;
}

.brand-copy{
  display:flex;
  flex-direction:column;
  justify-content:center;
  gap:4px;
  line-height:1.05;
}

.logo{
  width:42px;
  height:42px;
  border-radius:14px;
  display:grid;
  place-items:center;
  font-weight:700;
  font-size:14px;
  color:#fff;
  background:linear-gradient(140deg,#7d8bff,#b06cff);
  box-shadow:0 6px 20px rgba(140,110,255,.5);
  flex:0 0 auto;
}

.btitle{
  font-weight:650;
  font-size:16px;
  letter-spacing:-.01em;
}

.bsub{
  font-size:11.5px;
  color:var(--txt2);
  letter-spacing:.01em;
}

.search{
  display:flex;
  align-items:center;
  gap:10px;
  flex:1;
  max-width:360px;
  margin:0 auto;
  padding:11px 15px;
  border-radius:16px;
  background:rgba(255,255,255,.07);
  border:1px solid rgba(255,255,255,.1);
  color:var(--txt2);
}

.search input{
  border:0;
  background:transparent;
  outline:0;
  color:var(--txt);
  font-size:13.5px;
  width:100%;
}

.search input::placeholder{color:var(--txt2);}

.bar-right{
  display:flex;
  align-items:center;
  gap:14px;
  flex:0 0 auto;
}

.stamp{
  display:flex;
  align-items:center;
  gap:7px;
  font-size:12px;
  color:var(--txt2);
  font-variant-numeric:tabular-nums;
  white-space:nowrap;
}

.dot{
  width:8px;
  height:8px;
  border-radius:50%;
  background:#7b8299;
}

.dot.on{
  background:var(--pos);
  box-shadow:0 0 0 3px rgba(65,221,148,.22);
}

.seg{
  display:flex;
  background:rgba(255,255,255,.07);
  border:1px solid rgba(255,255,255,.1);
  border-radius:12px;
  padding:4px;
}

.seg button{
  border:0;
  background:transparent;
  padding:7px 10px;
  border-radius:9px;
  cursor:pointer;
  color:var(--txt2);
  display:grid;
  place-items:center;
}

.seg button.act{
  background:rgba(255,255,255,.16);
  color:#fff;
}

.grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:18px;
  max-width:1140px;
  margin:0 auto 20px;
}

.metric{
  padding:22px 22px 20px;
}

.metric.hero{
  background:linear-gradient(150deg,rgba(140,120,255,.22),rgba(255,255,255,.06));
  border-color:rgba(165,150,255,.45);
  box-shadow:var(--shadow),0 0 40px rgba(130,110,255,.18);
}

.m-label{
  display:flex;
  align-items:center;
  gap:8px;
  font-size:12.5px;
  color:var(--txt2);
  font-weight:550;
}

.m-num{
  font-size:34px;
  font-weight:660;
  letter-spacing:-.02em;
  margin-top:12px;
  font-variant-numeric:tabular-nums;
}

.m-num.big{
  font-size:44px;
}

.m-foot{
  font-size:11.5px;
  color:var(--txt2);
  margin-top:10px;
  line-height:1.45;
}

.m-foot b{color:var(--txt);}

.picks{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(268px,1fr));
  gap:18px;
  max-width:1140px;
  margin:0 auto;
}

.pick{
  padding:18px 18px 17px;
  display:flex;
  flex-direction:column;
  gap:14px;
  transition:transform .18s ease,box-shadow .18s ease;
}

.pick:hover{
  transform:translateY(-3px);
  box-shadow:0 18px 50px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.4);
}

.pick-top{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:10px;
}

.tk{
  font-family:"SF Mono",ui-monospace,Menlo,monospace;
  font-weight:600;
  font-size:14px;
  letter-spacing:-.02em;
}

.name{
  font-size:11.5px;
  color:var(--txt2);
  margin-top:4px;
}

.badge{
  font-size:10.5px;
  padding:5px 9px;
  border-radius:10px;
  background:rgba(255,255,255,.09);
  border:1px solid rgba(255,255,255,.08);
  color:var(--txt2);
  white-space:nowrap;
  flex:0 0 auto;
}

.pick-mid{
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
  gap:12px;
}

.ret{
  font-size:27px;
  font-weight:660;
  letter-spacing:-.02em;
  font-variant-numeric:tabular-nums;
}

.spark{
  width:132px;
  height:34px;
  flex:0 0 auto;
}

.rows{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px 16px;
  font-size:12px;
}

.rows > div{
  display:flex;
  justify-content:space-between;
  gap:10px;
}

.rows span{color:var(--txt2);}
.rows b{
  font-weight:600;
  font-variant-numeric:tabular-nums;
}

.tgt{
  margin-top:2px;
}

.tgt-track{
  height:7px;
  border-radius:999px;
  background:rgba(255,255,255,.12);
  overflow:hidden;
}

.tgt-fill{
  height:100%;
  border-radius:999px;
  background:linear-gradient(90deg,#7d8bff,#41dd94);
}

.tgt-fill.under{background:var(--neg);}

.tgt-label{
  font-size:10.5px;
  color:var(--txt2);
  margin-top:7px;
  display:block;
}

.thesis{
  font-size:11.5px;
  color:var(--txt2);
  line-height:1.5;
  border-top:1px solid rgba(255,255,255,.1);
  padding-top:12px;
  margin-top:2px;
}

.pick.err .err-body{
  display:flex;
  align-items:center;
  gap:8px;
  color:var(--neg);
  font-size:13px;
  padding:16px 0 2px;
}

.empty{
  grid-column:1/-1;
  text-align:center;
  color:var(--txt2);
  padding:44px;
  font-size:13.5px;
}

.method{
  max-width:1140px;
  margin:22px auto 0;
  text-align:center;
  font-size:11.5px;
  color:var(--txt2);
  line-height:1.5;
}

.tabs{
  position:fixed;
  bottom:20px;
  left:50%;
  transform:translateX(-50%);
  display:flex;
  gap:4px;
  padding:6px;
  z-index:5;
}

.tabs button{
  border:0;
  background:transparent;
  padding:9px 16px;
  border-radius:14px;
  cursor:pointer;
  color:var(--txt2);
  font-size:13px;
  font-weight:550;
}

.tabs button.act{
  background:rgba(255,255,255,.16);
  color:#fff;
}

@media(max-width:820px){
  .grid{grid-template-columns:repeat(2,1fr)}
  .bar{flex-wrap:wrap}
  .search{order:3;max-width:none;flex-basis:100%}
}

@media(max-width:520px){
  .grid{grid-template-columns:1fr}
  .bsub{display:none}
}

@media(prefers-reduced-motion:reduce){
  .pick{transition:none}
  .twinkle{animation:none}
}

:focus-visible{
  outline:2px solid #8c9bff;
  outline-offset:2px;
}
`;