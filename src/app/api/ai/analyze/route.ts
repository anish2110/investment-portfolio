import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
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

// ============================================================================
// INDIVIDUAL HOLDING ANALYSIS PROMPT - HIGHLY DETAILED
// ============================================================================
const createIndividualHoldingPrompt = (holding: Holding, allHoldings: Holding[]) => {
    const totalPortfolioValue = allHoldings.reduce((sum, h) => sum + h.quantity * h.last_price, 0);
    const holdingValue = holding.quantity * holding.last_price;
    const holdingInvestment = holding.quantity * holding.average_price;
    const holdingPnlPercentage = ((holdingValue - holdingInvestment) / holdingInvestment * 100).toFixed(2);
    const portfolioWeight = ((holdingValue / totalPortfolioValue) * 100).toFixed(2);

    const currentDate = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleDateString('en-IN', { month: 'long' });
    const currentDay = new Date().getDate();

    const isEquity = holding.type !== 'mf';
    const holdingType = isEquity ? 'Stock/Equity' : 'Mutual Fund';

    return `
# 🔬 DEEP DIVE ANALYSIS: ${holding.tradingsymbol}
**Analysis Date:** ${currentDate}
**Holding Type:** ${holdingType}
**Sector:** ${holding.sector || 'Unknown'}

---

## ⚠️ CRITICAL INSTRUCTIONS - MANDATORY WEB SEARCH ⚠️

**TODAY'S DATE: ${currentDate} (Year: ${currentYear})**

🚨 **YOU MUST SEARCH FOR ALL DATA - YOUR TRAINING DATA IS OUTDATED** 🚨

**REQUIRED SEARCHES BEFORE ANALYSIS:**
1. "${holding.tradingsymbol} stock news ${currentMonth} ${currentYear}"
2. "${holding.tradingsymbol} quarterly results ${currentYear}"
3. "${holding.tradingsymbol} analyst rating ${currentMonth} ${currentYear}"
4. "${holding.tradingsymbol} price target ${currentYear}"
5. "${holding.tradingsymbol} technical analysis ${currentMonth} ${currentYear}"
6. "${holding.tradingsymbol} management commentary ${currentYear}"
7. "${holding.tradingsymbol} institutional holdings ${currentYear}"
8. "${holding.tradingsymbol} promoter holding ${currentYear}"
${isEquity ? `9. "${holding.tradingsymbol} bulk block deals ${currentMonth} ${currentYear}"
10. "${holding.tradingsymbol} corporate actions ${currentYear}"` : `9. "${holding.tradingsymbol} NAV performance ${currentMonth} ${currentYear}"
10. "${holding.tradingsymbol} fund manager ${currentYear}"`}

**STRICT RULES:**
- ❌ NO data from 2024 or earlier
- ❌ NO hallucinated or imagined information
- ✅ CITE actual sources with dates
- ✅ If no current data found, state explicitly

---

## 🎯 YOUR ROLE

You are an elite equity research analyst with 20+ years of experience covering Indian markets. You have deep expertise in:
- Fundamental analysis (DCF, comparables, sum-of-parts valuation)
- Technical analysis (chart patterns, indicators, volume analysis)
- Sector dynamics and competitive positioning
- Management quality assessment
- Corporate governance evaluation
- Institutional flow analysis

---

## 📊 HOLDING DETAILS

| Metric | Value |
|--------|-------|
| **Symbol** | ${holding.tradingsymbol} |
| **Type** | ${holdingType} |
| **Sector** | ${holding.sector || 'Unknown'} |
| **Portfolio Weight** | ${portfolioWeight}% |
| **P&L Status** | ${Number(holdingPnlPercentage) >= 0 ? '🟢 Profit' : '🔴 Loss'} (${holdingPnlPercentage}%) |
| **Day Change** | ${holding.day_change_percentage?.toFixed(2) || 'N/A'}% |

---

## 📋 ANALYSIS FRAMEWORK - COMPLETE ALL SECTIONS

### SECTION 1: COMPANY/FUND OVERVIEW & BUSINESS MODEL
${isEquity ? `
**REQUIRED RESEARCH:**
- Company's core business segments and revenue mix
- Market position and competitive moat
- Key products/services and their market share
- Geographic revenue breakdown
- Business model sustainability

**QUESTIONS TO ANSWER:**
1. What are the company's primary revenue drivers?
2. What is the company's competitive advantage (moat)?
3. How defensible is the business model?
4. What are the key risks to the business model?
5. How is the company positioned vs competitors?
` : `
**REQUIRED RESEARCH:**
- Fund's investment objective and strategy
- Asset allocation and portfolio composition
- Top holdings and sector allocation
- Fund manager track record
- Expense ratio and exit load

**QUESTIONS TO ANSWER:**
1. What is the fund's investment philosophy?
2. How consistent is the fund's performance vs benchmark?
3. What is the fund manager's experience and track record?
4. How does expense ratio compare to category?
5. What are the key risks of this fund?
`}

---

### SECTION 2: RECENT NEWS & DEVELOPMENTS (LAST 30 DAYS)
**MANDATORY SEARCHES:**
- "${holding.tradingsymbol} latest news ${currentMonth} ${currentYear}"
- "${holding.tradingsymbol} announcements ${currentMonth} ${currentYear}"

**ANALYZE:**
1. **Earnings/NAV Updates:** Latest quarterly results, earnings beats/misses
2. **Management Commentary:** Key statements from management
3. **Corporate Actions:** Dividends, bonuses, splits, buybacks
4. **M&A Activity:** Any acquisition or divestiture news
5. **Regulatory Updates:** Policy changes affecting the company/fund
6. **Analyst Actions:** Rating changes, price target revisions
7. **Institutional Activity:** FII/DII/MF buying or selling

**FORMAT:**
| Date | News Item | Impact | Source |
|------|-----------|--------|--------|
| [Date] | [News headline] | [🟢 Positive / 🔴 Negative / 🟡 Neutral] | [Source] |

---

### SECTION 3: FUNDAMENTAL ANALYSIS
${isEquity ? `
**REQUIRED DATA POINTS (SEARCH FOR CURRENT VALUES):**
- P/E Ratio (TTM & Forward)
- P/B Ratio
- EV/EBITDA
- ROE & ROCE
- Debt/Equity Ratio
- Revenue Growth (YoY)
- Profit Growth (YoY)
- Operating Margin
- Net Margin
- Free Cash Flow Yield

**VALUATION ASSESSMENT:**
| Metric | Current Value | Industry Avg | Assessment |
|--------|--------------|--------------|------------|
| P/E Ratio | [X] | [X] | [Undervalued/Fair/Overvalued] |
| P/B Ratio | [X] | [X] | [Undervalued/Fair/Overvalued] |
| EV/EBITDA | [X] | [X] | [Undervalued/Fair/Overvalued] |
| ROE | [X]% | [X]% | [Strong/Average/Weak] |
| Debt/Equity | [X] | [X] | [Low/Moderate/High Risk] |

**EARNINGS QUALITY CHECK:**
- Is earnings growth backed by revenue growth?
- Are margins expanding or contracting?
- Is FCF positive and growing?
- Any red flags in receivables/inventory?
` : `
**REQUIRED DATA POINTS (SEARCH FOR CURRENT VALUES):**
- 1-Year Return
- 3-Year Return (CAGR)
- 5-Year Return (CAGR)
- Sharpe Ratio
- Standard Deviation
- Alpha vs Benchmark
- Beta
- Expense Ratio
- AUM
- Portfolio Turnover

**PERFORMANCE ASSESSMENT:**
| Metric | Fund Value | Category Avg | Benchmark | Assessment |
|--------|-----------|--------------|-----------|------------|
| 1Y Return | [X]% | [X]% | [X]% | [Outperformer/Average/Underperformer] |
| 3Y CAGR | [X]% | [X]% | [X]% | [Outperformer/Average/Underperformer] |
| Sharpe Ratio | [X] | [X] | - | [Good/Average/Poor] |
| Alpha | [X]% | [X]% | - | [Positive/Negative] |
`}

---

### SECTION 4: TECHNICAL ANALYSIS
**REQUIRED SEARCHES:**
- "${holding.tradingsymbol} chart analysis ${currentMonth} ${currentYear}"
- "${holding.tradingsymbol} support resistance levels ${currentYear}"

**ANALYZE:**
1. **Trend Analysis:**
   - Primary Trend (Long-term): [Uptrend/Downtrend/Sideways]
   - Secondary Trend (Medium-term): [Uptrend/Downtrend/Sideways]
   - Current Trend Strength: [Strong/Moderate/Weak]

2. **Moving Averages:**
   | MA | Level | Price Position | Signal |
   |----|-------|----------------|--------|
   | 20 DMA | [X] | [Above/Below] | [Bullish/Bearish] |
   | 50 DMA | [X] | [Above/Below] | [Bullish/Bearish] |
   | 200 DMA | [X] | [Above/Below] | [Bullish/Bearish] |

3. **Key Technical Indicators:**
   | Indicator | Value | Signal |
   |-----------|-------|--------|
   | RSI (14) | [X] | [Overbought/Neutral/Oversold] |
   | MACD | [X] | [Bullish/Bearish Crossover] |
   | ADX | [X] | [Strong/Weak Trend] |
   | Bollinger Bands | [X] | [Near Upper/Middle/Lower] |

4. **Support & Resistance Levels:**
   | Type | Level 1 | Level 2 | Level 3 |
   |------|---------|---------|---------|
   | Resistance | [X] | [X] | [X] |
   | Support | [X] | [X] | [X] |

5. **Chart Patterns:**
   - Any identifiable patterns (Head & Shoulders, Triangles, Flags, etc.)
   - Pattern implications and target levels

6. **Volume Analysis:**
   - Recent volume vs average volume
   - Volume confirmation of price moves
   - Any accumulation/distribution signals

---

### SECTION 5: INSTITUTIONAL & PROMOTER ACTIVITY
**REQUIRED SEARCHES:**
- "${holding.tradingsymbol} FII DII holding ${currentYear}"
- "${holding.tradingsymbol} promoter holding ${currentYear}"
- "${holding.tradingsymbol} mutual fund holding ${currentYear}"

**SHAREHOLDING PATTERN:**
| Category | Current % | QoQ Change | Trend |
|----------|----------|------------|-------|
| Promoters | [X]% | [+/-X]% | [🟢 Increasing / 🔴 Decreasing / 🟡 Stable] |
| FIIs | [X]% | [+/-X]% | [🟢 Increasing / 🔴 Decreasing / 🟡 Stable] |
| DIIs | [X]% | [+/-X]% | [🟢 Increasing / 🔴 Decreasing / 🟡 Stable] |
| Public | [X]% | [+/-X]% | [🟢 Increasing / 🔴 Decreasing / 🟡 Stable] |

**KEY OBSERVATIONS:**
- Promoter pledging status
- Any bulk/block deals in last 3 months
- MF scheme additions/exits
- Notable institutional investors

---

### SECTION 6: SECTOR & COMPETITIVE ANALYSIS
**REQUIRED SEARCHES:**
- "${holding.sector} sector outlook India ${currentYear}"
- "${holding.tradingsymbol} competitors ${currentYear}"

**SECTOR DYNAMICS:**
1. Current sector trend and outlook
2. Key sector drivers and headwinds
3. Government policy impact
4. Global sector trends affecting India

**COMPETITIVE POSITIONING:**
| Metric | ${holding.tradingsymbol} | Competitor 1 | Competitor 2 | Industry Avg |
|--------|--------------------------|--------------|--------------|--------------|
| Market Share | [X]% | [X]% | [X]% | - |
| Revenue Growth | [X]% | [X]% | [X]% | [X]% |
| Profit Margin | [X]% | [X]% | [X]% | [X]% |
| P/E Ratio | [X] | [X] | [X] | [X] |

**COMPETITIVE ADVANTAGES:**
- What makes this company better/worse than peers?
- Sustainable competitive advantages (if any)
- Key differentiators

---

### SECTION 7: RISK ASSESSMENT
**COMPREHENSIVE RISK MATRIX:**

| Risk Category | Risk Level | Details | Mitigation |
|---------------|------------|---------|------------|
| **Business Risk** | [Low/Med/High] | [Specific risk] | [How to mitigate] |
| **Financial Risk** | [Low/Med/High] | [Debt, liquidity concerns] | [How to mitigate] |
| **Valuation Risk** | [Low/Med/High] | [Is it expensive?] | [How to mitigate] |
| **Sector Risk** | [Low/Med/High] | [Sector headwinds] | [How to mitigate] |
| **Regulatory Risk** | [Low/Med/High] | [Policy changes] | [How to mitigate] |
| **Governance Risk** | [Low/Med/High] | [Management/Board issues] | [How to mitigate] |
| **Liquidity Risk** | [Low/Med/High] | [Trading volume concerns] | [How to mitigate] |
| **Concentration Risk** | [Low/Med/High] | [Client/Product concentration] | [How to mitigate] |

**RED FLAGS TO MONITOR:**
- [ ] Promoter pledging
- [ ] Related party transactions
- [ ] Auditor qualifications
- [ ] Frequent management changes
- [ ] Declining cash flows
- [ ] Rising debt levels
- [ ] Governance controversies

---

### SECTION 8: CATALYST CALENDAR
**UPCOMING EVENTS THAT COULD MOVE THE STOCK:**

| Date | Event | Expected Impact | Watch For |
|------|-------|-----------------|-----------|
| [Date] | Quarterly Results | [High/Medium/Low] | [Key metrics] |
| [Date] | AGM | [High/Medium/Low] | [Key announcements] |
| [Date] | Dividend | [High/Medium/Low] | [Ex-date approach] |
| [Date] | Sector Policy | [High/Medium/Low] | [Policy details] |

---

### SECTION 9: INVESTMENT THESIS

**BULL CASE (Why this could outperform):**
1. [Reason 1 with specific data]
2. [Reason 2 with specific data]
3. [Reason 3 with specific data]
- **Bull Case Target:** [X]% upside potential
- **Probability:** [X]%

**BASE CASE (Most likely scenario):**
1. [Reason 1 with specific data]
2. [Reason 2 with specific data]
3. [Reason 3 with specific data]
- **Base Case Target:** [X]% return expected
- **Probability:** [X]%

**BEAR CASE (Why this could underperform):**
1. [Risk 1 with specific data]
2. [Risk 2 with specific data]
3. [Risk 3 with specific data]
- **Bear Case Target:** [X]% downside risk
- **Probability:** [X]%

---

### SECTION 10: FINAL VERDICT & RECOMMENDATIONS

#### 10.1 Overall Rating
| Dimension | Score (1-10) | Comment |
|-----------|--------------|---------|
| **Fundamental Strength** | [X] | [One-line assessment] |
| **Technical Setup** | [X] | [One-line assessment] |
| **Valuation Attractiveness** | [X] | [One-line assessment] |
| **Growth Potential** | [X] | [One-line assessment] |
| **Risk-Reward Balance** | [X] | [One-line assessment] |
| **OVERALL SCORE** | **[X/10]** | **[Summary verdict]** |

#### 10.2 Investment Action
| Current Weight | Recommended Weight | Action | Conviction |
|----------------|-------------------|--------|------------|
| ${portfolioWeight}% | [X]% | **[🟢 BUY MORE / 🟡 HOLD / 🟠 REDUCE / 🔴 SELL]** | [High/Medium/Low] |

#### 10.3 Specific Recommendations
1. **Immediate Action:** [What to do right now]
2. **Price Targets:**
   - 🎯 Target 1 (3 months): [Level] ([X]% upside)
   - 🎯 Target 2 (12 months): [Level] ([X]% upside)
3. **Stop Loss:** [Level] ([X]% downside from current)
4. **Accumulation Zone:** [Range] (if applicable)
5. **Key Triggers for Re-evaluation:** [Specific events]

#### 10.4 Position Sizing Guidance
- **Maximum Allocation:** [X]% of portfolio
- **Scaling Strategy:** [How to add/reduce]
- **Rebalancing Trigger:** [When to rebalance]

---

## 🚫 CONSTRAINTS
1. **NO MONETARY VALUES** - Only percentages and allocations
2. **CITE ALL SOURCES** - With dates
3. **BE DECISIVE** - No wishy-washy recommendations
4. **CURRENT DATA ONLY** - All from ${currentYear}

---

**NOW EXECUTE THE COMPLETE ANALYSIS FOR ${holding.tradingsymbol}**
`;
};

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

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleDateString('en-IN', { month: 'long' });
    const currentDay = new Date().getDate();

    return `
# ELITE PORTFOLIO INTELLIGENCE BRIEFING
**Analysis Date:** ${currentDate}

---

## ⚠️ CRITICAL DATE & DATA INSTRUCTIONS - READ FIRST ⚠️

**TODAY'S DATE IS: ${currentDate} (Year: ${currentYear})**

🚨 **MANDATORY WEB SEARCH REQUIREMENT** 🚨

You MUST use Google Search for EVERY piece of market data, news, and analysis. Your training data is OUTDATED.

**BEFORE WRITING ANYTHING:**
1. Search for "India stock market news ${currentMonth} ${currentYear}" 
2. Search for "Nifty 50 current level ${currentMonth} ${currentDay} ${currentYear}"
3. Search for "RBI interest rate ${currentYear}"
4. Search for "India VIX today ${currentMonth} ${currentYear}"
5. Search for each stock ticker + "latest news ${currentMonth} ${currentYear}"

**STRICT RULES:**
- ❌ DO NOT use any data from 2024 or earlier - that is STALE
- ❌ DO NOT hallucinate or imagine market conditions
- ❌ DO NOT say "as of my knowledge cutoff" - USE SEARCH instead
- ✅ ALWAYS search for current ${currentYear} data
- ✅ CITE the actual sources and dates from your searches
- ✅ If search returns no results, explicitly state "No current data found for [X]"

**The user's portfolio needs analysis based on CURRENT ${currentYear} market conditions, NOT historical data.**

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

*You MUST use Google Search to research and analyze the following before evaluating the portfolio:*
*⚠️ ALL DATA MUST BE FROM ${currentYear} - Search for each item explicitly!*

### 1.1 Global Macroeconomic Environment
**REQUIRED SEARCHES:**
- "RBI monetary policy ${currentMonth} ${currentYear}"
- "Federal Reserve interest rate ${currentMonth} ${currentYear}"  
- "India inflation rate ${currentMonth} ${currentYear}"
- "USD INR exchange rate ${currentMonth} ${currentYear}"

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
**REQUIRED SEARCHES:**
- "Nifty 50 today ${currentMonth} ${currentDay} ${currentYear}"
- "India VIX current level ${currentMonth} ${currentYear}"
- "FII DII activity ${currentMonth} ${currentYear}"
- "Sensex today ${currentMonth} ${currentYear}"

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
**REQUIRED SEARCHES (use these exact queries):**
- "India stock market news today ${currentMonth} ${currentDay} ${currentYear}"
- "Nifty Sensex news ${currentMonth} ${currentYear}"
- "Indian economy news ${currentMonth} ${currentYear}"

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
**⚠️ FOR EVERY STOCK, you MUST search: "[TICKER] stock news ${currentMonth} ${currentYear}"**

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
5. **CURRENT INFORMATION ONLY:** All analysis must reflect TODAY's market conditions (${currentDate}), NOT historical data from 2024 or earlier.
6. **MANDATORY WEB SEARCH:** You MUST use Google Search for all data. Your training data is from 2024 and is STALE.
7. **INDIAN MARKET CONTEXT:** Primary focus on Indian markets (NSE/BSE), with global context where relevant.
8. **DATE IN SEARCHES:** Always include "${currentYear}" in your search queries to get the latest data.
9. **SOURCE CITATION:** Always mention where you got your data (e.g., "According to Economic Times, Jan 29, 2026...").

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
        const { holdings, analysisType, symbol } = await request.json();

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

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

        // Initialize the model with specific capabilities (Tools & System Instructions)
        const model = genAI.getGenerativeModel({
            model: "gemini-3-pro-preview",

            // 1. Setup Grounding (Google Search)
            tools: [
                //@ts-ignore
                { googleSearch: {} }
            ],

            // 2. Setup Deep Research Persona with explicit date awareness
            systemInstruction: {
                role: "system",
                parts: [{
                    text: `You are an advanced AI Analyst capable of "Deep Research". 

                    🚨 CRITICAL: TODAY'S DATE IS ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} (YEAR: ${new Date().getFullYear()})
                    
                    Your training data is OUTDATED. You MUST use Google Search for ALL market data, stock prices, news, and economic indicators.
                    
                    Operational Protocols:
                    1. THINKING: Before answering, strictly use your thinking process to outline a research strategy.
                    2. GROUNDING: Verify EVERY factual claim using Google Search. Do NOT rely on internal knowledge for data, news, or stock prices.
                    3. DATE VERIFICATION: Always include "${new Date().getFullYear()}" in your search queries to get current data. REJECT any results from 2024 or earlier.
                    4. ITERATION: If a search result is ambiguous or old, perform a follow-up search with more specific date terms.
                    5. SYNTHESIS: Provide a final answer that cites the ACTUAL sources and dates found during the grounding process.
                    6. TRANSPARENCY: If you cannot find current ${new Date().getFullYear()} data for something, explicitly state "No current data found" rather than using old training data.
                    
                    FORBIDDEN ACTIONS:
                    - Do NOT use any market data, stock prices, or news from your training data (2024 or earlier)
                    - Do NOT hallucinate or fabricate current market conditions
                    - Do NOT say "as of my knowledge cutoff" - USE GOOGLE SEARCH INSTEAD`
                }]
            }
        });

        // Determine which prompt to use based on analysis type
        const isIndividualAnalysis = analysisType === 'individual' && symbol;
        let prompt: string;

        if (isIndividualAnalysis) {
            const targetHolding = holdings.find((h: Holding) => h.tradingsymbol === symbol);
            if (!targetHolding) {
                return NextResponse.json(
                    { error: `Holding ${symbol} not found` },
                    { status: 400 }
                );
            }
            prompt = createIndividualHoldingPrompt(targetHolding, holdings);
        } else {
            prompt = createAnalysisPrompt(holdings);
        }

        const response = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],

            // 3. Configure Reasoning & Retrieval
            generationConfig: {
                // Enable the "Thinking" process (visible in response.candidates[0].content.parts)
                //@ts-ignore
                thinkingConfig: {
                    includeThoughts: true
                },
                // Adjust temperature for more analytical output
                temperature: 0.2,
            },

            // Dynamic retrieval configuration
            toolConfig: {
                functionCallingConfig: {
                    mode: "AUTO"
                }
            }
        });

        const responseText = response.response.text();
        if (!responseText) {
            return NextResponse.json(
                { error: "No response from Gemini API" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            analysis: responseText,
            type: isIndividualAnalysis ? 'individual' : 'portfolio',
            symbol: isIndividualAnalysis ? symbol : undefined
        });
    } catch (error) {
        console.error("Analysis error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Analysis failed" },
            { status: 500 }
        );
    }
}
