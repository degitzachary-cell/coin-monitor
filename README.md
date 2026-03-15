# SOL Monitor

Real-time Solana (SOL/USDT) perpetual futures signal monitor. Single `index.html` — no build step, no dependencies, runs in any browser.

**Data source:** Bybit V5 public API (no auth). Auto-refreshes every 10 seconds.

---

## Signal Output

### FIRE Signals
Triggers when Long or Short score reaches **≥ 3.5 / 4.0**. Each event plays an audio tone, sends a push notification, and is **logged to `localStorage`**.

**Storage key:** `fire-log` — JSON array, last 20 events:
```json
{
  "time": "14:32:07",
  "dir": "LONG",
  "price": 134.21,
  "score": 3.75,
  "bb": "82%",
  "srsi1": "K:18 D:22",
  "srsi5": "K:12 D:15",
  "macd": "bullish",
  "vol": "2.3x"
}
```

Read from console: `JSON.parse(localStorage.getItem('fire-log'))`

### Bias Gauge
Continuous **−100% → +100%** score updated every refresh. Driven by: BB position, StochRSI 1m/5m, MACD, OB/FVG proximity, 15m EMA, 1H EMA. Ghost needle (red) = 3-cycle rolling average.

### Scalpability Score
**0–100** composite: BB width + volume spike + candle body quality + signal readiness + momentum clarity.

---

## Indicators (all client-side)

| Indicator | Timeframe |
|-----------|-----------|
| Stochastic RSI K/D | 1m, 5m |
| Bollinger Bands (20, 2σ) | 5m |
| MACD (12/26/9) | 5m |
| EMA trend filter | 15m (EMA-10), 1H (EMA-20) |
| Volume spike ratio | 1m, 5m vs. 20-bar avg |
| Support / Resistance clusters | 5m pivots |
| Order Blocks | 15m |
| Fair Value Gaps | 15m |
| Liquidity sweep detection | 1m |
| BTC correlation context | 5m BTCUSDT EMA |
| OI trend | 12 × 5min snapshots |
| BB squeeze meter | Bottom 10% of 50-bar width dist. |
| Round level proximity | Nearest $5 increment |
| Funding rate history | Last 8 payments |

---

## Context Strip

| Value | Meaning |
|-------|---------|
| `SOL LAGGING ▲` | BTC up, SOL hasn't caught up → long bias |
| `SOL STRONG ✦` | BTC weak, SOL holding → avoid shorts |
| `SOL WEAK ▼` | SOL falling faster than BTC → confirms short |
| `OI FLUSH ▼▼` | OI collapsing → stand aside |
| `SQUEEZING` | BB width in bottom 10% → breakout imminent |
| `⚡ $X.XX` | Within 1.5% of round $5 level → sweep risk |

---

## Persistent Storage

| Key | Contents |
|-----|----------|
| `fire-log` | Last 20 FIRE events (JSON array) |
| `coin-monitor-symbol` | Last-used symbol (default: `SOLUSDT`) |

---

## Running

```bash
open index.html
# or
python3 -m http.server 8000
```

PWA-ready: installable to home screen. Service worker caches app shell (`sol-monitor-v3`).

---

## Files

```
coin-monitor/
├── index.html      # Everything — HTML, CSS, JS (~1670 lines)
├── sw.js           # Service worker
├── manifest.json   # PWA manifest
└── icon-*.png      # App icons (76–512px)
```
