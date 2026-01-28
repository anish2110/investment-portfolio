// Static sector mapping for NSE/BSE stocks
// Categories: Banking, IT, Pharma, FMCG, Auto, Metals, Energy, Realty, Telecom, Infrastructure, Chemicals, Textiles, Media, Financials

// Mutual Fund Categories - keyword based classification
export type MutualFundCategory =
    | "Large Cap"
    | "Mid Cap"
    | "Small Cap"
    | "Flexi Cap"
    | "Multi Cap"
    | "ELSS"
    | "Index Fund"
    | "Debt"
    | "Hybrid"
    | "International"
    | "Sectoral"
    | "Liquid"
    | "Other MF";

export type Sector =
    | "Banking"
    | "IT"
    | "Pharma"
    | "FMCG"
    | "Auto"
    | "Metals"
    | "Energy"
    | "Realty"
    | "Telecom"
    | "Infrastructure"
    | "Chemicals"
    | "Textiles"
    | "Media"
    | "Financials"
    | "Insurance"
    | "Cement"
    | "Consumer Durables"
    | "Aviation"
    | "Hospitality"
    | MutualFundCategory
    | "Others";

// Comprehensive mapping of NSE stock symbols to sectors
const sectorMapping: Record<string, Sector> = {
    // Banking
    HDFCBANK: "Banking",
    ICICIBANK: "Banking",
    SBIN: "Banking",
    KOTAKBANK: "Banking",
    AXISBANK: "Banking",
    INDUSINDBK: "Banking",
    BANKBARODA: "Banking",
    PNB: "Banking",
    IDFCFIRSTB: "Banking",
    FEDERALBNK: "Banking",
    BANDHANBNK: "Banking",
    AUBANK: "Banking",
    RBLBANK: "Banking",
    CANBK: "Banking",
    UNIONBANK: "Banking",
    INDIANB: "Banking",
    IOB: "Banking",
    CENTRALBK: "Banking",
    UCOBANK: "Banking",
    BANKINDIA: "Banking",
    MAHABANK: "Banking",
    PSB: "Banking",
    J_KBANK: "Banking",
    KARURVYSYA: "Banking",
    TMBANK: "Banking",
    DCBBANK: "Banking",
    SOUTHBANK: "Banking",
    CUB: "Banking",
    EQUITASBNK: "Banking",
    UJJIVANSFB: "Banking",
    ESAFSFB: "Banking",

    // IT / Technology
    TCS: "IT",
    INFY: "IT",
    WIPRO: "IT",
    HCLTECH: "IT",
    TECHM: "IT",
    LTIM: "IT",
    PERSISTENT: "IT",
    COFORGE: "IT",
    MPHASIS: "IT",
    LTTS: "IT",
    MINDTREE: "IT",
    BIRLASOFT: "IT",
    NIITLTD: "IT",
    NIIT: "IT",
    HAPPSTMNDS: "IT",
    MASTEK: "IT",
    ZENSARTECH: "IT",
    CYIENT: "IT",
    SONATSOFTW: "IT",
    TATAELXSI: "IT",
    KPITTECH: "IT",
    ECLERX: "IT",
    QUICKHEAL: "IT",
    NEWGEN: "IT",
    TANLA: "IT",
    ROUTE: "IT",
    INTELLECT: "IT",
    OFSS: "IT",
    FIRSTSOUR: "IT",
    DATAPATTNS: "IT",

    // Pharma / Healthcare
    SUNPHARMA: "Pharma",
    DRREDDY: "Pharma",
    CIPLA: "Pharma",
    DIVISLAB: "Pharma",
    APOLLOHOSP: "Pharma",
    BIOCON: "Pharma",
    LUPIN: "Pharma",
    AUROPHARMA: "Pharma",
    TORNTPHARM: "Pharma",
    ALKEM: "Pharma",
    GLENMARK: "Pharma",
    ZYDUSLIFE: "Pharma",
    IPCALAB: "Pharma",
    LAURUSLABS: "Pharma",
    ABBOTINDIA: "Pharma",
    PFIZER: "Pharma",
    SANOFI: "Pharma",
    GLAXO: "Pharma",
    NATCOPHARMA: "Pharma",
    GRANULES: "Pharma",
    AJANTPHARM: "Pharma",
    FORTIS: "Pharma",
    MAXHEALTH: "Pharma",
    MEDANTA: "Pharma",
    RAINBOW: "Pharma",
    METROPOLIS: "Pharma",
    LALPATHLAB: "Pharma",
    THYROCARE: "Pharma",
    GLAND: "Pharma",
    SOLARA: "Pharma",

    // FMCG
    HINDUNILVR: "FMCG",
    ITC: "FMCG",
    NESTLEIND: "FMCG",
    BRITANNIA: "FMCG",
    DABUR: "FMCG",
    MARICO: "FMCG",
    GODREJCP: "FMCG",
    COLPAL: "FMCG",
    TATACONSUM: "FMCG",
    VBL: "FMCG",
    PGHH: "FMCG",
    EMAMILTD: "FMCG",
    MCDOWELL_N: "FMCG",
    UBL: "FMCG",
    RADICO: "FMCG",
    GLOBUSSPR: "FMCG",
    BIKAJI: "FMCG",
    DMART: "FMCG",
    TRENT: "FMCG",
    SHOPERSTOP: "FMCG",
    VMART: "FMCG",
    ZOMATO: "FMCG",
    DEVYANI: "FMCG",
    JUBLFOOD: "FMCG",
    WESTLIFE: "FMCG",
    SAPPHIRE: "FMCG",
    PATANJALI: "FMCG",
    HONAUT: "FMCG",

    // Auto / Automobile
    MARUTI: "Auto",
    TATAMOTORS: "Auto",
    M_M: "Auto",
    BAJAJ_AUTO: "Auto",
    HEROMOTOCO: "Auto",
    EICHERMOT: "Auto",
    ASHOKLEY: "Auto",
    TVSMOTOR: "Auto",
    BHARATFORG: "Auto",
    MOTHERSON: "Auto",
    BOSCHLTD: "Auto",
    MRF: "Auto",
    APOLLOTYRE: "Auto",
    BALKRISIND: "Auto",
    CEAT: "Auto",
    EXIDEIND: "Auto",
    AMARAJABAT: "Auto",
    SONACOMS: "Auto",
    SAMVARDHAN: "Auto",
    SUNDRMFAST: "Auto",
    ESCORTS: "Auto",
    FORCEMOT: "Auto",
    OLECTRA: "Auto",
    JBMA: "Auto",
    ENDURANCE: "Auto",
    SUPRAJIT: "Auto",
    UNOMINDA: "Auto",
    SCHAEFFLER: "Auto",
    SKFINDIA: "Auto",
    TIMKEN: "Auto",

    // Metals & Mining
    TATASTEEL: "Metals",
    JSWSTEEL: "Metals",
    HINDALCO: "Metals",
    VEDL: "Metals",
    COALINDIA: "Metals",
    NMDC: "Metals",
    SAIL: "Metals",
    JINDALSTEL: "Metals",
    NATIONALUM: "Metals",
    HINDZINC: "Metals",
    APLAPOLLO: "Metals",
    RATNAMANI: "Metals",
    WELCORP: "Metals",
    TINPLATE: "Metals",
    MOIL: "Metals",
    GMRINFRA: "Metals",
    KIOCL: "Metals",
    HLEGLAS: "Metals",
    ORIENTCEM: "Metals",
    SHYAMMETL: "Metals",

    // Energy / Oil & Gas
    RELIANCE: "Energy",
    ONGC: "Energy",
    BPCL: "Energy",
    IOC: "Energy",
    GAIL: "Energy",
    NTPC: "Energy",
    POWERGRID: "Energy",
    ADANIGREEN: "Energy",
    TATAPOWER: "Energy",
    ADANIPOWER: "Energy",
    NHPC: "Energy",
    SJVN: "Energy",
    TORNTPOWER: "Energy",
    CESC: "Energy",
    JSWENERGY: "Energy",
    PETRONET: "Energy",
    MGL: "Energy",
    IGL: "Energy",
    GUJGASLTD: "Energy",
    ATGL: "Energy",
    AEGISCHEM: "Energy",
    GSPL: "Energy",
    HPCL: "Energy",
    OIL: "Energy",
    MRPL: "Energy",
    CHENNPETRO: "Energy",
    IOCL: "Energy",
    CASTROLIND: "Energy",
    GULFOILLUB: "Energy",

    // Realty / Real Estate
    DLF: "Realty",
    GODREJPROP: "Realty",
    OBEROIRLTY: "Realty",
    PRESTIGE: "Realty",
    PHOENIXLTD: "Realty",
    BRIGADE: "Realty",
    SOBHA: "Realty",
    SUNTECK: "Realty",
    MAHLIFE: "Realty",
    LODHA: "Realty",
    RAYMOND: "Realty",
    IBREALEST: "Realty",
    ANANTRAJ: "Realty",
    KOLTEPATIL: "Realty",
    ASHIANA: "Realty",
    ARVIND: "Realty",
    PURVA: "Realty",
    SIGACHI: "Realty",

    // Telecom
    BHARTIARTL: "Telecom",
    IDEA: "Telecom",
    TATACOMM: "Telecom",
    INDUSTOWER: "Telecom",
    STLTECH: "Telecom",
    HFCL: "Telecom",
    TEJAS: "Telecom",
    GTPL: "Telecom",
    NAZARA: "Telecom",
    SANSERA: "Telecom",
    RAILTEL: "Telecom",

    // Infrastructure / Construction
    LT: "Infrastructure",
    ADANIENT: "Infrastructure",
    ADANIPORTS: "Infrastructure",
    ULTRACEMCO: "Infrastructure",
    GRASIM: "Infrastructure",
    SHREECEM: "Infrastructure",
    AMBUJACEM: "Infrastructure",
    ACC: "Infrastructure",
    DALBHARAT: "Infrastructure",
    RAMCOCEM: "Infrastructure",
    JKCEMENT: "Infrastructure",
    JKPAPER: "Infrastructure",
    IRCON: "Infrastructure",
    RVNL: "Infrastructure",
    NBCC: "Infrastructure",
    NCC: "Infrastructure",
    KEC: "Infrastructure",
    KALPATPOWR: "Infrastructure",
    THERMAX: "Infrastructure",
    BEL: "Infrastructure",
    HAL: "Infrastructure",
    BHEL: "Infrastructure",
    SIEMENS: "Infrastructure",
    ABB: "Infrastructure",
    CGPOWER: "Infrastructure",
    CUMMINSIND: "Infrastructure",
    GRINDWELL: "Infrastructure",
    CARBORUNIV: "Infrastructure",
    BLUESTARCO: "Infrastructure",
    VOLTAS: "Infrastructure",
    HAVELLS: "Infrastructure",
    POLYCAB: "Infrastructure",
    FINOLEX: "Infrastructure",
    KEI: "Infrastructure",
    AIAENG: "Infrastructure",

    // Chemicals
    PIDILITIND: "Chemicals",
    SRF: "Chemicals",
    AARTI: "Chemicals",
    ATUL: "Chemicals",
    DEEPAKNI: "Chemicals",
    NAVINFLUOR: "Chemicals",
    FINEORG: "Chemicals",
    CLEAN: "Chemicals",
    FLUOROCHEM: "Chemicals",
    TATACHEM: "Chemicals",
    ALKYLAMINE: "Chemicals",
    GALAXYSURF: "Chemicals",
    VINATIORG: "Chemicals",
    LXCHEM: "Chemicals",
    NEOGEN: "Chemicals",
    NOCIL: "Chemicals",
    PHILIPCARB: "Chemicals",
    SUDARSCHEM: "Chemicals",
    BASF: "Chemicals",
    BALAMINES: "Chemicals",

    // Financials (NBFCs, Asset Management, etc.)
    BAJFINANCE: "Financials",
    BAJAJFINSV: "Financials",
    HDFCAMC: "Financials",
    SBILIFE: "Financials",
    HDFCLIFE: "Financials",
    ICICIPRULI: "Financials",
    MUTHOOTFIN: "Financials",
    CHOLAFIN: "Financials",
    SHRIRAMFIN: "Financials",
    MANAPPURAM: "Financials",
    L_TFH: "Financials",
    M_MFIN: "Financials",
    IIFL: "Financials",
    POONAWALLA: "Financials",
    LICHSGFIN: "Financials",
    CANFINHOME: "Financials",
    HOMEFIRST: "Financials",
    AAVAS: "Financials",
    APTUS: "Financials",
    CREDITACC: "Financials",
    FUSION: "Financials",
    ANGELONE: "Financials",
    MOTILALOFS: "Financials",
    ICICIGI: "Financials",
    STARHEALTH: "Financials",
    NAM_INDIA: "Financials",
    UTIAMC: "Financials",
    CAMS: "Financials",
    BSE: "Financials",
    CDSL: "Financials",
    MCX: "Financials",

    // Insurance
    LICI: "Insurance",
    BAJAJHLDNG: "Insurance",
    NIACL: "Insurance",
    GICRE: "Insurance",

    // Cement
    BIRLACORPN: "Cement",
    JKLAKSHMI: "Cement",
    HEIDELBERG: "Cement",
    INDIACEM: "Cement",
    PRISMCEM: "Cement",
    SAGCEM: "Cement",
    STARCEM: "Cement",
    NCLIND: "Cement",
    SANGAMIND: "Cement",
    KESORAMIND: "Cement",

    // Consumer Durables
    TITAN: "Consumer Durables",
    CROMPTON: "Consumer Durables",
    WHIRLPOOL: "Consumer Durables",
    SYMPHONY: "Consumer Durables",
    VGUARD: "Consumer Durables",
    ORIENTELEC: "Consumer Durables",
    RAJESHEXPO: "Consumer Durables",
    BATAINDIA: "Consumer Durables",
    RELAXO: "Consumer Durables",
    METROBRAND: "Consumer Durables",
    PAGEIND: "Consumer Durables",
    KAJARIACER: "Consumer Durables",
    CERA: "Consumer Durables",
    SOMERSETHO: "Consumer Durables",
    AMBER: "Consumer Durables",
    DIXON: "Consumer Durables",
    KAYNES: "Consumer Durables",

    // Aviation
    INDIGO: "Aviation",
    SPICEJET: "Aviation",
    AIRINDIA: "Aviation",
    GMRAIRPORT: "Aviation",

    // Hospitality / Hotels
    INDHOTEL: "Hospitality",
    EIHOTEL: "Hospitality",
    LEMONTREE: "Hospitality",
    CHALET: "Hospitality",
    TAJGVK: "Hospitality",
    IHLHOME: "Hospitality",

    // Media / Entertainment
    ZEEL: "Media",
    PVRINOX: "Media",
    SUNTV: "Media",
    TV18BRDCST: "Media",
    NETWORK18: "Media",
    INOXLEISUR: "Media",
    SAREGAMA: "Media",
    TIPS: "Media",
    NAVNETEDUL: "Media",

    // Textiles
    TRIDENT: "Textiles",
    PGHL: "Textiles",
    WELSPUNIND: "Textiles",
    VARDHMAN: "Textiles",
    KPR: "Textiles",
    LUXIND: "Textiles",
    LAXMIMACH: "Textiles",
    GOKEX: "Textiles",
    HIMATSEIDE: "Textiles",
    NITINSPINNER: "Textiles",
    SPANDANA: "Textiles",
    BSLLTD: "Textiles",
    DOLLAR: "Textiles",
};

// Additional aliases and variations
const symbolAliases: Record<string, string> = {
    "M&M": "M_M",
    "BAJAJ-AUTO": "BAJAJ_AUTO",
    "L&TFH": "L_TFH",
    "M&MFIN": "M_MFIN",
    "MCDOWELL-N": "MCDOWELL_N",
    "J&KBANK": "J_KBANK",
    "NAM-INDIA": "NAM_INDIA",
};

/**
 * Get sector for a stock symbol
 * @param symbol - Stock trading symbol (e.g., "RELIANCE", "TCS")
 * @returns Sector classification or "Others" if not found
 */
export function getSector(symbol: string): Sector {
    const normalizedSymbol = symbol.toUpperCase().trim();

    // Mutual Fund ISINs typically start with INF
    if (normalizedSymbol.startsWith("INF")) {
        return "Other MF";
    }

    // Check direct mapping
    if (sectorMapping[normalizedSymbol]) {
        return sectorMapping[normalizedSymbol];
    }

    // Check aliases
    const aliasKey = symbolAliases[normalizedSymbol];
    if (aliasKey && sectorMapping[aliasKey]) {
        return sectorMapping[aliasKey];
    }

    return "Others";
}

/**
 * Get all sectors
 */
export function getAllSectors(): Sector[] {
    return [
        "Banking",
        "IT",
        "Pharma",
        "FMCG",
        "Auto",
        "Metals",
        "Energy",
        "Realty",
        "Telecom",
        "Infrastructure",
        "Chemicals",
        "Textiles",
        "Media",
        "Financials",
        "Insurance",
        "Cement",
        "Consumer Durables",
        "Aviation",
        "Hospitality",
        "Others",
    ];
}

/**
 * Get all mutual fund categories
 */
export function getAllMutualFundCategories(): MutualFundCategory[] {
    return [
        "Large Cap",
        "Mid Cap",
        "Small Cap",
        "Flexi Cap",
        "Multi Cap",
        "ELSS",
        "Index Fund",
        "Debt",
        "Hybrid",
        "International",
        "Sectoral",
        "Liquid",
        "Other MF",
    ];
}

/**
 * Get mutual fund category based on fund name (keyword-based detection)
 * @param fundName - The name of the mutual fund
 * @returns Category classification for the mutual fund
 */
export function getMutualFundCategory(fundName: string): MutualFundCategory {
    const name = fundName.toLowerCase();

    // Index Funds - check first as they may contain other keywords
    if (
        name.includes("index") ||
        name.includes("nifty 50") ||
        name.includes("sensex") ||
        name.includes("nifty next 50") ||
        name.includes("nifty50") ||
        name.includes("etf")
    ) {
        return "Index Fund";
    }

    // ELSS - Tax saving
    if (
        name.includes("elss") ||
        name.includes("tax saver") ||
        name.includes("tax saving") ||
        name.includes("taxsaver")
    ) {
        return "ELSS";
    }

    // Liquid Funds
    if (
        name.includes("liquid") ||
        name.includes("money market") ||
        name.includes("overnight")
    ) {
        return "Liquid";
    }

    // Debt Funds
    if (
        name.includes("debt") ||
        name.includes("bond") ||
        name.includes("gilt") ||
        name.includes("corporate bond") ||
        name.includes("credit risk") ||
        name.includes("dynamic bond") ||
        name.includes("short term") ||
        name.includes("ultra short") ||
        name.includes("medium term") ||
        name.includes("long term") ||
        name.includes("banking & psu") ||
        name.includes("floating rate")
    ) {
        return "Debt";
    }

    // Hybrid Funds
    if (
        name.includes("hybrid") ||
        name.includes("balanced") ||
        name.includes("equity savings") ||
        name.includes("arbitrage") ||
        name.includes("aggressive hybrid") ||
        name.includes("conservative hybrid") ||
        name.includes("dynamic asset") ||
        name.includes("multi asset")
    ) {
        return "Hybrid";
    }

    // International Funds
    if (
        name.includes("international") ||
        name.includes("global") ||
        name.includes("us equity") ||
        name.includes("nasdaq") ||
        name.includes("s&p 500") ||
        name.includes("emerging market") ||
        name.includes("feeder") ||
        name.includes("fof") ||
        name.includes("fund of fund")
    ) {
        return "International";
    }

    // Sectoral/Thematic Funds
    if (
        name.includes("sectoral") ||
        name.includes("thematic") ||
        name.includes("banking") ||
        name.includes("pharma") ||
        name.includes("healthcare") ||
        name.includes("technology") ||
        name.includes("infrastructure") ||
        name.includes("consumption") ||
        name.includes("manufacturing") ||
        name.includes("psu equity") ||
        name.includes("dividend yield") ||
        name.includes("value fund") ||
        name.includes("focused")
    ) {
        return "Sectoral";
    }

    // Small Cap
    if (name.includes("small cap") || name.includes("smallcap")) {
        return "Small Cap";
    }

    // Mid Cap
    if (name.includes("mid cap") || name.includes("midcap")) {
        return "Mid Cap";
    }

    // Large Cap
    if (
        name.includes("large cap") ||
        name.includes("largecap") ||
        name.includes("bluechip") ||
        name.includes("blue chip")
    ) {
        return "Large Cap";
    }

    // Flexi Cap
    if (name.includes("flexi cap") || name.includes("flexicap")) {
        return "Flexi Cap";
    }

    // Multi Cap
    if (name.includes("multi cap") || name.includes("multicap")) {
        return "Multi Cap";
    }

    // Large & Mid Cap
    if (name.includes("large & mid") || name.includes("large and mid")) {
        return "Large Cap";
    }

    return "Other MF";
}

/**
 * Sector colors for charts - using a professional color palette
 */
export const sectorColors: Record<Sector, string> = {
    Banking: "hsl(220, 70%, 50%)",
    IT: "hsl(262, 83%, 58%)",
    Pharma: "hsl(142, 71%, 45%)",
    FMCG: "hsl(24, 95%, 53%)",
    Auto: "hsl(340, 82%, 52%)",
    Metals: "hsl(200, 18%, 46%)",
    Energy: "hsl(47, 95%, 53%)",
    Realty: "hsl(291, 64%, 42%)",
    Telecom: "hsl(173, 80%, 40%)",
    Infrastructure: "hsl(30, 80%, 55%)",
    Chemicals: "hsl(280, 60%, 50%)",
    Textiles: "hsl(350, 65%, 60%)",
    Media: "hsl(190, 90%, 50%)",
    Financials: "hsl(210, 90%, 60%)",
    Insurance: "hsl(160, 60%, 45%)",
    Cement: "hsl(40, 30%, 50%)",
    "Consumer Durables": "hsl(310, 70%, 55%)",
    Aviation: "hsl(200, 80%, 60%)",
    Hospitality: "hsl(15, 80%, 55%)",
    // Mutual Fund Categories
    "Large Cap": "hsl(220, 80%, 55%)",
    "Mid Cap": "hsl(280, 70%, 55%)",
    "Small Cap": "hsl(340, 75%, 55%)",
    "Flexi Cap": "hsl(180, 70%, 45%)",
    "Multi Cap": "hsl(200, 75%, 50%)",
    "ELSS": "hsl(142, 65%, 50%)",
    "Index Fund": "hsl(260, 60%, 55%)",
    "Debt": "hsl(45, 80%, 50%)",
    "Hybrid": "hsl(30, 85%, 55%)",
    "International": "hsl(320, 70%, 50%)",
    "Sectoral": "hsl(10, 75%, 55%)",
    "Liquid": "hsl(190, 75%, 45%)",
    "Other MF": "hsl(280, 50%, 55%)",
    Others: "hsl(0, 0%, 50%)",
};

/**
 * Get a CSS variable-based chart color by index
 */
export function getChartColor(index: number): string {
    const colors = [
        "var(--chart-1)",
        "var(--chart-2)",
        "var(--chart-3)",
        "var(--chart-4)",
        "var(--chart-5)",
    ];
    return colors[index % colors.length];
}
