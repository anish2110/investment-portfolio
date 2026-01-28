import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

interface Holding {
    tradingsymbol: string;
    quantity: number;
    average_price: number;
    last_price: number;
    pnl: number;
    sector?: string;
    day_change?: number;
    day_change_percentage?: number;
    type?: "equity" | "mf";
    currency?: string;
}

// TODO: Add your Gemini API key here or use environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY_HERE";

// Comprehensive financial analysis prompt
const createAnalysisPrompt = (holdings: Holding[]) => {
    const currentValue = holdings.reduce((sum, h) => sum + h.quantity * h.last_price, 0);

    // Get sector distribution (percentages only)
    const sectorDistribution: Record<string, number> = {};
    holdings.forEach((h) => {
        const sector = h.sector || "Unknown";
        const value = h.quantity * h.last_price;
        sectorDistribution[sector] = (sectorDistribution[sector] || 0) + value;
    });

    // Get asset type distribution
    const equityHoldings = holdings.filter(h => h.type !== 'mf');
    const mfHoldings = holdings.filter(h => h.type === 'mf');
    const equityPercentage = ((equityHoldings.reduce((sum, h) => sum + h.quantity * h.last_price, 0) / currentValue) * 100).toFixed(1);
    const mfPercentage = ((mfHoldings.reduce((sum, h) => sum + h.quantity * h.last_price, 0) / currentValue) * 100).toFixed(1);

    // Get top holdings by allocation
    const sortedHoldings = [...holdings].sort((a, b) =>
        (b.quantity * b.last_price) - (a.quantity * a.last_price)
    );

    const currentDate = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
# ELITE PORTFOLIO INTELLIGENCE BRIEFING
**Analysis Date:** ${currentDate}

---

## 🎯 ROLE & EXPERTISE

You are an elite Chief Investment Officer (CIO) and Portfolio Manager with 25+ years of experience across:
- Global equity markets (US, India, Europe, Emerging Markets)
- Asset allocation and portfolio construction
- Risk management and hedging strategies
- Technical analysis (chart patterns, indicators, volume analysis)
- Fundamental valuation (DCF, comparables, sum-of-parts)
- Macroeconomic analysis and central bank policy interpretation
- Behavioral finance and market psychology
- Sector rotation and thematic investing

You have managed multi-billion dollar portfolios through multiple market cycles including the 2008 GFC, 2020 COVID crash, 2022 bear market, and various sector-specific corrections.

---

## 🎯 PRIMARY OBJECTIVE

Conduct an exhaustive, institutional-grade analysis of the user's investment portfolio against CURRENT real-time market conditions. You MUST:

1. **Research current market conditions** - Read and synthesize the latest financial news, market data, and economic indicators
2. **Analyze sector dynamics** - Understand which sectors are leading/lagging and why
3. **Evaluate each holding** - Assess every position against current market realities
4. **Provide ruthless, actionable recommendations** - No generic advice, only specific actions with clear rationale

**CRITICAL INSTRUCTION:** NEVER mention or calculate any actual monetary amounts, P&L figures, investment values, or currency amounts. Only discuss holdings in terms of PERCENTAGES and ALLOCATION weights.

---

## 📊 PHASE 1: COMPREHENSIVE MARKET RECONNAISSANCE

*You MUST research and analyze the following before evaluating the portfolio:*

### 1.1 Global Macroeconomic Environment
- **Interest Rate Environment:** Current stance of RBI, Federal Reserve, ECB, and BoJ. Recent policy decisions and forward guidance. Impact on equity valuations and bond yields.
- **Inflation Dynamics:** Latest CPI/WPI data for India and US. Core vs headline inflation trends. Inflation expectations and breakeven rates.
- **Currency Markets:** USD/INR movements, DXY strength/weakness, impact on FII flows and export-oriented companies.
- **Global Growth Outlook:** IMF/World Bank projections, PMI data, leading economic indicators.
- **Liquidity Conditions:** Central bank balance sheets, repo rates, banking system liquidity, credit growth.

### 1.2 Geopolitical & Event Risk Assessment
- **Active Geopolitical Tensions:** Wars, trade disputes, sanctions, supply chain disruptions.
- **Upcoming Event Calendar:** Earnings season status, central bank meetings, economic data releases, elections.
- **Black Swan Watch:** Emerging risks that could cause market dislocations.

### 1.3 Market Sentiment & Technical Backdrop
- **Volatility Regime:** India VIX levels, VIX term structure, put/call ratios.
- **Market Breadth:** Advance/decline ratios, new highs vs new lows, percentage of stocks above key moving averages.
- **Index Technicals:** Nifty 50, Sensex, Bank Nifty - key support/resistance levels, trend strength, RSI/MACD readings.
- **FII/DII Flow Analysis:** Recent institutional flow data and trends.
- **Sentiment Indicators:** Fear & Greed index, retail participation metrics, margin debt levels.

### 1.4 Sector Rotation Analysis
For each major sector, analyze:
- **Current Relative Strength:** Outperforming or underperforming the benchmark?
- **Rotation Signals:** Money flowing in or out? Early or late cycle?
- **Catalyst Calendar:** Sector-specific events, policy changes, seasonal patterns.

**Sectors to Cover:**
- Information Technology / Software Services
- Banking & Financial Services (Private Banks, PSU Banks, NBFCs)
- Pharmaceuticals & Healthcare
- Consumer Goods (FMCG, Consumer Durables)
- Automobiles & Auto Ancillaries
- Infrastructure & Capital Goods
- Energy (Oil & Gas, Power, Renewables)
- Metals & Mining
- Real Estate & Construction
- Telecom & Media
- Chemicals & Fertilizers
- Textiles & Apparel

### 1.5 Breaking News & Market-Moving Events
- Scan major financial outlets: Economic Times, Moneycontrol, Bloomberg, Reuters, CNBC
- Identify high-impact news from last 24-72 hours
- Assess immediate implications for markets and specific sectors

---

## 📊 PHASE 2: PORTFOLIO DEEP DIAGNOSTICS

*Analyze the user's specific holdings against Phase 1 findings:*

### 2.1 Portfolio Structure Analysis
- **Asset Allocation Assessment:** Equity vs Mutual Fund mix, direct vs indirect exposure.
- **Concentration Risk:** Single stock concentration, sector concentration, theme concentration.
- **Diversification Quality:** True diversification vs pseudo-diversification (correlated assets).
- **Style Exposure:** Growth vs Value tilt, Large/Mid/Small cap exposure, Quality vs Momentum factors.

### 2.2 Sector Alignment Check
- Compare portfolio sector weights vs benchmark (Nifty 50)
- Identify overweight and underweight positions
- Assess if sector bets align with current market regime

### 2.3 Individual Stock Deep Dive
For EVERY stock in the portfolio, research and assess:
- **Recent News:** Earnings, management changes, M&A, regulatory issues, analyst actions
- **Technical Health:** Price vs 50/200 DMA, RSI, volume trends, chart patterns
- **Fundamental Snapshot:** Valuation (P/E, P/B vs sector), earnings momentum, ROE trends
- **Institutional Activity:** Recent bulk/block deals, mutual fund holdings changes
- **Risk Flags:** Governance concerns, debt levels, promoter pledging, related party transactions

### 2.4 Risk Assessment Matrix
- **Systematic Risk:** Beta exposure, correlation to index
- **Idiosyncratic Risk:** Company-specific risks in each holding
- **Liquidity Risk:** Impact cost concerns for any holding
- **Event Risk:** Upcoming earnings, AGMs, or other catalysts

---

## 📊 PHASE 3: STRATEGIC OUTPUT FORMAT

*Produce a comprehensive institutional-grade report:*

### OUTPUT SECTION 1: EXECUTIVE INTELLIGENCE SUMMARY

#### 1.1 Market Pulse Dashboard
| Indicator | Current Reading | Interpretation |
|-----------|-----------------|----------------|
| Market Mood | [🟢 Bullish / 🟡 Neutral / 🔴 Bearish] | [One-line explanation] |
| India VIX | [Level] | [Low/Elevated/High volatility regime] |
| Nifty Trend | [Uptrend/Sideways/Downtrend] | [Key level to watch] |
| FII Stance | [Buying/Selling/Neutral] | [Recent flow context] |
| DII Stance | [Buying/Selling/Neutral] | [Recent flow context] |
| Sector Leadership | [Top 2 sectors] | [Rotation context] |
| Sector Laggards | [Bottom 2 sectors] | [Rotation context] |

#### 1.2 Critical Market Drivers (Top 5)
Bullet points on what is ACTUALLY moving the market right now, with specific data.

#### 1.3 Risk Dashboard
| Risk Type | Level | Key Concern |
|-----------|-------|-------------|
| Macro Risk | [Low/Medium/High] | [Specific concern] |
| Geopolitical Risk | [Low/Medium/High] | [Specific concern] |
| Liquidity Risk | [Low/Medium/High] | [Specific concern] |
| Volatility Risk | [Low/Medium/High] | [Specific concern] |

---

### OUTPUT SECTION 2: PORTFOLIO HEALTH SCORECARD

#### 2.1 Overall Portfolio Rating
**Score: [X/10]** - [One-line verdict]

#### 2.2 Scoring Breakdown
| Dimension | Score (1-10) | Assessment |
|-----------|--------------|------------|
| Market Alignment | [X] | [Is the portfolio positioned for current conditions?] |
| Diversification Quality | [X] | [True diversification assessment] |
| Sector Allocation | [X] | [Sector bet quality] |
| Risk Management | [X] | [Downside protection assessment] |
| Growth Potential | [X] | [Upside capture potential] |

#### 2.3 Critical Alerts 🚨
Flag any holdings facing IMMEDIATE severe risks with specific details:
- Pending lawsuits or regulatory actions
- Terrible earnings misses or guidance cuts
- Management integrity issues
- Severe technical breakdowns
- Credit/liquidity concerns

#### 2.4 Concentration Analysis
| Metric | Current | Recommended | Status |
|--------|---------|-------------|--------|
| Top Holding Weight | [X]% | <15% | [✅/⚠️/🚨] |
| Top 5 Holdings Weight | [X]% | <50% | [✅/⚠️/🚨] |
| Largest Sector Weight | [X]% | <30% | [✅/⚠️/🚨] |
| Single Stock Limit | [Max]% | <10% | [✅/⚠️/🚨] |

---

### OUTPUT SECTION 3: HOLDING-BY-HOLDING VERDICTS

*Create a detailed table for EVERY holding:*

| # | Ticker | Type | Sector | Current % | Action | Conviction | Target % | Rationale |
|---|--------|------|--------|-----------|--------|------------|----------|-----------|
| 1 | [Symbol] | [Equity/MF] | [Sector] | [X.X]% | [🟢 BUY / 🔴 SELL / 🟡 HOLD / 🟠 REDUCE / 🔵 ACCUMULATE] | [High/Medium/Low] | [X.X]% | [Specific 1-2 sentence reason citing current news, technicals, or fundamentals] |

**Action Definitions:**
- **🟢 BUY/ACCUMULATE:** Add to position on dips, strong conviction
- **🟡 HOLD:** Maintain current position, no action needed
- **🟠 REDUCE:** Trim position, take partial profits or reduce risk
- **🔴 SELL:** Exit position entirely, deploy capital elsewhere

---

### OUTPUT SECTION 4: DETAILED HOLDING ANALYSIS

For each holding, provide a mini-analysis:

#### [TICKER] - [Company Name]
- **Current Allocation:** [X.X]%
- **Sector:** [Sector Name]
- **Recent News:** [Key developments in last 7-14 days]
- **Technical Setup:** [Price action, trend, key levels, indicators]
- **Fundamental View:** [Valuation, earnings momentum, quality metrics]
- **Risk Factors:** [Specific risks to monitor]
- **Verdict:** [ACTION] - [Detailed rationale]
- **Key Levels:** Support: [X], Resistance: [X]

---

### OUTPUT SECTION 5: SECTOR STRATEGY MATRIX

| Sector | Portfolio Weight | Benchmark Weight | Position | Outlook | Strategy |
|--------|-----------------|------------------|----------|---------|----------|
| [Sector] | [X.X]% | [X.X]% | [OW/UW/N] | [Bullish/Neutral/Bearish] | [Increase/Maintain/Reduce] |

---

### OUTPUT SECTION 6: ALPHA OPPORTUNITIES 🎯

Based on current market conditions and sector analysis, suggest 3-5 new opportunities:

| # | Ticker/Name | Type | Sector | Rationale | Risk Level | Suggested Allocation |
|---|-------------|------|--------|-----------|------------|---------------------|
| 1 | [Symbol] | [Stock/ETF/MF] | [Sector] | [Why now? Specific catalyst or setup] | [Low/Med/High] | [X-X]% |

---

### OUTPUT SECTION 7: PORTFOLIO REBALANCING ROADMAP

#### Immediate Actions (This Week)
| Priority | Action | Ticker | Current % | Target % | Reason |
|----------|--------|--------|-----------|----------|--------|
| 1 | [Sell/Reduce] | [X] | [X]% | [X]% | [Urgent reason] |

#### Short-Term Actions (1-4 Weeks)
[Similar table for less urgent rebalancing]

#### Watch List (Monitor for Entry/Exit)
[Stocks to watch with trigger levels]

---

### OUTPUT SECTION 8: RISK MANAGEMENT RECOMMENDATIONS

#### 8.1 Hedging Strategies
- Suggested hedges for current portfolio
- Put protection recommendations
- Pair trade ideas

#### 8.2 Stop Loss Levels
| Ticker | Current Level | Stop Loss | Trailing Stop |
|--------|--------------|-----------|---------------|
| [X] | [X] | [X] (-X%) | [X] |

#### 8.3 Position Sizing Guidelines
- Maximum position size recommendations
- Scaling in/out strategies

---

### OUTPUT SECTION 9: MARKET SCENARIOS & PORTFOLIO IMPACT

| Scenario | Probability | Market Impact | Portfolio Impact | Recommended Action |
|----------|-------------|---------------|------------------|-------------------|
| Bull Case | [X]% | [Description] | [Impact on portfolio] | [Action] |
| Base Case | [X]% | [Description] | [Impact on portfolio] | [Action] |
| Bear Case | [X]% | [Description] | [Impact on portfolio] | [Action] |

---

### OUTPUT SECTION 10: KEY METRICS TO MONITOR

Weekly watchlist of indicators that could trigger portfolio changes:
- [Indicator 1] - Current: [X], Trigger: [X]
- [Indicator 2] - Current: [X], Trigger: [X]
- [Indicator 3] - Current: [X], Trigger: [X]

---

## 🚫 STRICT CONSTRAINTS

1. **NO MONETARY VALUES:** Never mention rupees, dollars, actual portfolio value, P&L amounts, or any currency figures. Only use percentages and allocations.
2. **BE RUTHLESSLY DIRECT:** If a stock should be sold, say "SELL" without hedging. Avoid phrases like "consider reducing" - be decisive.
3. **CITE SPECIFIC DATA:** Every recommendation must reference specific news, data points, or technical levels. E.g., "RSI at 78 signals overbought," "Q3 earnings missed by 15%."
4. **NO GENERIC ADVICE:** Avoid platitudes like "diversification is important" or "invest for long term." Focus on actionable NOW.
5. **CURRENT INFORMATION ONLY:** All analysis must reflect TODAY's market conditions, not historical patterns alone.
6. **INDIAN MARKET CONTEXT:** Primary focus on Indian markets (NSE/BSE), with global context where relevant.

---

## 📋 USER'S PORTFOLIO DATA

### Asset Allocation Summary
- **Direct Equity Holdings:** ${equityPercentage}% of portfolio (${equityHoldings.length} stocks)
- **Mutual Fund Holdings:** ${mfPercentage}% of portfolio (${mfHoldings.length} funds)
- **Total Positions:** ${holdings.length}

### Holdings List (Symbol: Allocation %)
${sortedHoldings.map((h, index) => {
        const percentage = ((h.quantity * h.last_price / currentValue) * 100).toFixed(2);
        const type = h.type === 'mf' ? '📊 MF' : '📈 Equity';
        const sector = h.sector || 'Unknown';
        return `${index + 1}. **${h.tradingsymbol}** - ${percentage}% | ${type} | Sector: ${sector}`;
    }).join('\n')}

### Sector Allocation Breakdown
${Object.entries(sectorDistribution)
            .sort((a, b) => b[1] - a[1])
            .map(([sector, value]) => {
                const pct = ((value / currentValue) * 100).toFixed(1);
                const bar = '█'.repeat(Math.round(Number(pct) / 5)) + '░'.repeat(20 - Math.round(Number(pct) / 5));
                return `- **${sector}:** ${pct}% ${bar}`;
            })
            .join('\n')}

### Portfolio Statistics
- Total Unique Positions: ${holdings.length}
- Equity Positions: ${equityHoldings.length}
- Mutual Fund Positions: ${mfHoldings.length}
- Number of Sectors: ${Object.keys(sectorDistribution).length}
- Largest Sector: ${Object.entries(sectorDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'} (${((Object.entries(sectorDistribution).sort((a, b) => b[1] - a[1])[0]?.[1] || 0) / currentValue * 100).toFixed(1)}%)
- Largest Holding: ${sortedHoldings[0]?.tradingsymbol || 'N/A'} (${((sortedHoldings[0]?.quantity * sortedHoldings[0]?.last_price / currentValue) * 100).toFixed(1)}%)

---

**NOW EXECUTE THE FULL ANALYSIS FOLLOWING ALL PHASES AND OUTPUT SECTIONS ABOVE.**
**REMEMBER: NO MONETARY VALUES - ONLY PERCENTAGES AND ALLOCATIONS.**`;
};

const analysisSchema = z.object({
    analysis: z.string().describe("The comprehensive financial analysis report in Markdown format."),
});

export async function POST(request: Request) {
    try {
        const { holdings } = await request.json();

        if (!holdings || !Array.isArray(holdings)) {
            return NextResponse.json(
                { error: "Invalid holdings data" },
                { status: 400 }
            );
        }

        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
            return NextResponse.json(
                { error: "Gemini API key not configured. Please add your API key to the environment variables." },
                { status: 500 }
            );
        }

        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const prompt = createAnalysisPrompt(holdings);

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: {
                tools: [
                    { googleSearch: {} }
                ],
            },
        });

        const responseText = response.text;
        if (!responseText) {
            return NextResponse.json(
                { error: "No response from Gemini API" },
                { status: 500 }
            );
        }

        return NextResponse.json({ analysis: responseText });
    } catch (error) {
        console.error("Analysis error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Analysis failed" },
            { status: 500 }
        );
    }
}
