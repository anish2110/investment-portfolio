export interface Holding {
    tradingsymbol: string;
    quantity: number;
    average_price: number;
    last_price: number;
    pnl: number;
    sector?: string;
    day_change?: number;
    day_change_percentage?: number;
    exchange?: string;
    isin?: string;
    instrument_token?: number;
    t1_quantity?: number;
    realised_quantity?: number;
    authorised_quantity?: number;
    opening_quantity?: number;
    collateral_quantity?: number;
    collateral_type?: string;
    used_quantity?: number;
    // Added for Mutual Funds support
    fund?: string;
    folio?: string;
    type?: 'equity' | 'mf';
    currency?: string;
}

export interface SectorData {
    name: string;
    value: number;
    investment: number;
    currentValue: number;
    pnl: number;
    pnlPercentage: number;
    count: number;
    color: string;
    holdings: Holding[];
}

export interface PortfolioMetrics {
    totalInvestment: number;
    currentValue: number;
    totalPnl: number;
    totalPnlPercentage: number;
    dayChange: number;
    dayChangePercentage: number;
    topGainer: Holding | null;
    topLoser: Holding | null;
    diversificationScore: number;
    concentrationRisk: number;
    numberOfStocks: number;
    numberOfSectors: number;
    largestHolding: {
        holding: Holding;
        percentage: number;
    } | null;
    top5Concentration: number;
}

export interface StockPerformance {
    symbol: string;
    sector: string;
    investment: number;
    currentValue: number;
    pnl: number;
    pnlPercentage: number;
    quantity: number;
    avgPrice: number;
    lastPrice: number;
    portfolioWeight: number;
}
