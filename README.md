# SOL Monitor

A real-time Solana perpetual futures trading monitor built as a single HTML file. No installation, no server, no dependencies — open in any browser and it runs.

Hosted on GitHub Pages. Uses Bybit's public API and TradingView's free chart widget.

---

## Features

### Live Data (auto-refreshes every 10 seconds)
- **Price header** — current mark price, 24h change %, 24h high/low, turnover
- **Funding rate** — current rate with colour-coded danger thresholds, countdown to next payment
- **Open interest** — displayed in USD (M/B), with live ▲/▼ direction arrow
- **Session levels banner** — editable support, resistance, breakout, and session low levels

### Signals & Scoring
- **Bias gauge** — continuous −100% → +100% needle driven by BB position, StochRSI, MACD, OB/FVG proximity, 15m and 1H trend
- **Long / Short signal panels** — scored out of 4.0; FIRE (≥3.5) triggers audio and push notification
- **Scalpability score** — 0–100 composite from BB width, volume, candle body quality, signal readiness, and momentum clarity
- **Red flags** — contextual warnings injected before each render cycle

### Technical Indicators (computed client-side)
| Indicator | Timeframes |
|-----------|-----------|
| Stochastic RSI (K/D) | 1m, 5m |
| Bollinger Bands (20, 2σ) | 5m |
| MACD (12/26/9) | 5m |
| EMA trend | 15m (10-period), 1H (20-period) |
| Volume spike ratio | 1m, 5m (vs 20-bar average) |
| Support / Resistance clusters | 5m pivot detection |
| Order Blocks (bullish & bearish) | 15m |
| Fair Value Gaps (bullish & bearish) | 15m |
| Liquidity sweep detection | 1m |

### Context Strip (added in v3)
| Field | What it shows |
|-------|---------------|
| BTC Context | SOL vs BTCUSDT 5m EMA — lagging, strong, weak, or confirming |
| OI Trend | Open interest direction over last 12 × 5min snapshots |
| BB State | Squeezing / Normal / Expanding relative to last 50-bar width distribution |
| Round Level | Nearest $5 increment and distance — flags liquidity sweep risk |

---

## How to Use

1. Open the GitHub Pages URL in any browser (desktop or mobile, add to home screen on iOS/Android)
2. The monitor auto-fetches on load and every 10 seconds
3. Use **APPLY** to change the symbol or refresh interval
4. Use **LEVELS** to set your own session support/resistance/breakout prices — the banner updates immediately

### Reading the Signals

**Long FIRE (≥ 3.5/4.0)** — price at/below lower BB + StochRSI 5m oversold cross + volume spike + bounce candle. All four align rarely; when they do the risk/reward is typically excellent.

**Short FIRE (≥ 3.5/4.0)** — price at/above upper BB + StochRSI 5m overbought cross + rejection candle.

**Context Strip interpretation:**
- `SOL LAGGING ▲` — BTC already moved up but SOL hasn't caught up yet → long bias
- `SOL STRONG ✦` — BTC is weak but SOL is holding → relative strength long, avoid shorts
- `SOL WEAK ▼` — SOL falling faster than BTC → confirms short, avoid longs
- `OI FLUSH ▼▼` — open interest collapsing rapidly → liquidation cascade in progress, stand aside

### Alerts
Notifications and audio tones fire once per FIRE transition (not on every refresh). Grant notification permission when prompted to receive push alerts when the app is in the background.

---

## Technical Details

- **API**: Bybit V5 public endpoints — no authentication required
  - `/v5/market/kline` — OHLCV candles (1m, 5m, 15m, 1H, plus BTCUSDT 5m)
  - `/v5/market/tickers` — funding rate, mark price, OI, 24h stats
  - `/v5/market/funding/history` — last 8 funding payments for crowding detection
  - `/v5/market/open-interest` — 12 × 5min OI snapshots for trend detection
- **Chart**: TradingView embedded widget (5m candles + StochRSI overlay)
- **PWA**: Service worker caches app shell for offline/home-screen use
- **No build step**: everything is vanilla JS in a single `index.html`

---

## Versions & Changelog

### v3 — Signal Improvements (current)
*Branch: `claude/investigate-codebase-AGR72`*

Five new detection layers added on top of the v2 engine:

1. **BTC correlation context** — fetches BTCUSDT 5m klines each cycle; classifies SOL as lagging, showing relative strength, underperforming, or confirming BTC's move. Adjusts long/short scoring and is displayed in the new context strip.

2. **OI direction trend** — replaces single-cycle ▲/▼ OI arrow with a proper trend derived from 12 × 5min open-interest snapshots. Rising OI in the direction of the trend scores +0.25 to the matching side. Collapsing OI generates a red flag and blocks long scoring.

3. **Bollinger Band squeeze meter** — tracks BB width `(upper−lower)/mid` over all 150 bars; flags "SQUEEZING" when the current width is in the bottom 10% of the last 50-bar distribution. Volatility expansion is imminent when this fires.

4. **Round number auto-detection** — calculates nearest $5 increment to current price. Within 1.5% generates a red flag warning of a likely liquidity sweep through the level before continuation.

5. **Funding rate history** — fetches last 8 funding payment rates. Persistent positive average (>0.04%) flags crowded longs; persistent negative flags short squeeze risk. Both appear in red flags when a signal is forming on the same side as the crowd.

**Also fixed:** Session levels banner now updates immediately when the LEVELS panel SET button is pressed (was previously static HTML).

**Service worker:** cache bumped to `sol-monitor-v3`.

---

### v2 — Core Engine & Perp Data
*Merged via PR #7*

- Stochastic RSI on both 1m and 5m timeframes
- MACD histogram scoring on 5m
- Bollinger Bands position scoring (5m, 20-period)
- Volume spike detection (1m and 5m vs 20-bar average)
- 15m EMA trend filter (EMA-10) and 1H structural bias (EMA-20)
- Order Block detection on 15m (bullish demand / bearish supply)
- Fair Value Gap detection on 15m (bullish / bearish)
- OB/FVG proximity context alerts and dedicated zone card
- Liquidity sweep detection on 1m (stop hunt identification)
- Bias gauge with continuous needle (−100% → +100%)
- Scalpability score (0–100 composite)
- Perp data strip — funding rate, next funding countdown, mark price, open interest
- Funding rate red flag injection (>0.05% / <−0.05% / within 10m of payment)
- Session levels panel (editable via LEVELS button)
- FIRE signal (score ≥ 3.5) with audio tone (C-E-G / G-E-C arpeggios) and push notification
- Service worker offline shell caching (`sol-monitor-v2`)

---

### v1 — Initial Release
- Live price header with 24h change badge
- Basic Bybit ticker and kline fetching
- TradingView 5m chart embed
- Auto-refresh countdown bar
- PWA manifest and home-screen icon support
- iOS Safari compatibility (Notification API guard)

---

## File Structure

```
coin-monitor/
├── index.html      # Everything — HTML, CSS, JS in one file (~1560 lines)
├── sw.js           # Service worker (cache-first shell, network-first for APIs)
├── manifest.json   # PWA manifest
├── icon-*.png      # App icons (76, 120, 152, 180, 192, 512px)
└── README.md       # This file
```
