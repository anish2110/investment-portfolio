# 📊 Investment Portfolio Dashboard

A comprehensive investment portfolio tracking and analytics application that integrates with **Zerodha** (Kite & Coin) and **Vested** to provide real-time portfolio insights, advanced analytics, and AI-powered analysis of your investments.

## 🌟 Features

- **📊 Real-time Portfolio Tracking**: Seamlessly view all holdings from Zerodha Kite, Zerodha Coin (mutual funds), and Vested in a unified dashboard
- **📈 Advanced Analytics**: 
  - Sector allocation analysis with interactive visualizations
  - Portfolio performance metrics and comparisons
  - Risk analysis and diversification metrics
  - Heatmaps for holdings overview
  - Top movers identification
- **🤖 AI-Powered Insights**: Get intelligent analysis of your portfolio using Google Gemini AI
  - Portfolio optimization suggestions
  - Risk assessment
  - Investment recommendations
  - Analysis history and saved reports
- **💼 Cost Basis Analysis**: Track your investment costs and gains with detailed metrics
- **🎨 Beautiful, Intuitive UI**: Built with modern tech stack
  - Next.js 16+ with App Router
  - TypeScript for type safety
  - Tailwind CSS for styling
  - shadcn/ui components for consistency
  - Recharts for data visualization
- **🔒 Local-First & Secure**: 
  - No authentication or login required
  - All data stays on your machine
  - Direct API integration (no third-party servers)

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org/))
- **Zerodha Account** with Kite Connect API access ([Apply here](https://developers.kite.trade/))
- **Google Gemini API Key** ([Get it free here](https://makersuite.google.com/app/apikey))

### Setup Instructions

**1. Clone and Install**
```bash
git clone <repository-url>
cd investment-portfolio
npm install
```

**2. Get API Credentials**

a) **Zerodha Kite Connect API**:
   - Visit [developers.kite.trade](https://developers.kite.trade/)
   - Create a new app (or use existing)
   - Note your **API Key** and **API Secret**
   - **Critical**: Add redirect URL: `http://localhost:3001/callback`

b) **Google Gemini API Key**:
   - Visit [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy it

**3. Configure Environment**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
KITE_API_KEY=your_api_key_here
KITE_API_SECRET=your_api_secret_here
GEMINI_API_KEY=your_gemini_key_here
```

**4. Authenticate with Zerodha**
```bash
npm run kite-auth
```

This will:
- Open your browser for Zerodha login
- Handle OAuth flow automatically
- Save your access token to `.env.local`

⚠️ **Note**: Kite tokens expire daily around 3:30 AM IST. Re-run this command each day.

**5. Start the Application**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your portfolio dashboard!

## 📱 How to Use

### Dashboard Overview
1. **Portfolio Summary** - See your total portfolio value and key metrics
2. **Holdings Table** - View all stocks with current prices and performance
3. **Sector Allocation** - Visualize portfolio distribution across sectors
4. **Performance Analysis** - Compare your holdings against market benchmarks
5. **Risk Analysis** - Understand portfolio concentration and diversification
6. **AI Analysis** - Get personalized insights from Gemini AI

### Key Features

**Sync Holdings**
- Click the sync button to refresh holdings from Zerodha Kite and Coin
- Automatically fetches latest prices and performance data

**AI Analysis**
- Click "Get AI Analysis" to generate insights about your portfolio
- View previous analyses in the history tab
- Includes recommendations and risk assessment

**Export Data**
- Save holdings data as CSV
- Export analysis reports for reference

## 📁 Project Structure

```
investment-portfolio/
├── src/
│   ├── app/                          # Next.js app directory (App Router)
│   │   ├── api/                      # API routes
│   │   │   ├── zerodha/             # Zerodha integration endpoints
│   │   │   │   ├── holdings/        # Fetch holdings (stocks)
│   │   │   │   ├── mutual-funds/    # Fetch mutual funds
│   │   │   │   └── session/         # Session management
│   │   │   ├── vested/              # Vested integration endpoints
│   │   │   │   └── holdings/        # Fetch Vested holdings
│   │   │   └── ai/                  # AI analysis endpoints
│   │   │       ├── analyze/         # Generate new analysis
│   │   │       └── history/         # Retrieve analysis history
│   │   ├── globals.css              # Global styles
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Dashboard page
│   ├── components/                  # React components
│   │   ├── analytics/               # Dashboard analytics components
│   │   │   ├── HoldingsTable.tsx    # Stocks/holdings table
│   │   │   ├── SectorAllocation.tsx # Sector visualization
│   │   │   ├── PortfolioMetrics.tsx # Key metrics display
│   │   │   ├── RiskAnalysis.tsx     # Risk metrics
│   │   │   ├── CostBasisAnalysis.tsx# Cost & gains tracking
│   │   │   ├── AIAnalysis.tsx       # AI insights display
│   │   │   ├── AnalysisHistory.tsx  # Previous analyses
│   │   │   ├── PerformanceComparison.tsx # Performance charts
│   │   │   ├── TopMovers.tsx        # Best/worst performers
│   │   │   ├── DiversificationRadar.tsx  # Diversification metrics
│   │   │   └── StockDetailModal.tsx # Detailed stock view
│   │   └── ui/                      # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── table.tsx
│   │       ├── chart.tsx
│   │       └── ... (other UI components)
│   └── lib/
│       ├── types.ts                 # TypeScript type definitions
│       ├── sectors.ts               # Sector configuration
│       └── utils.ts                 # Utility functions
├── scripts/
│   ├── kite-auth.js                 # Zerodha authentication helper
│   └── README.md                    # Script documentation
├── public/
│   └── analyses/                    # Stored AI analysis reports
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── next.config.ts                   # Next.js configuration
├── tailwind.config.ts               # Tailwind CSS configuration
└── README.md                        # This file
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Port 3000) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |
| `npm run kite-auth` | Authenticate with Zerodha Kite |

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `KITE_API_KEY` | Zerodha Kite API Key | `abc123def456` |
| `KITE_API_SECRET` | Zerodha Kite API Secret | `xyz789uvw456` |
| `GEMINI_API_KEY` | Google Gemini API Key | `gkey_abc123...` |

### Port Configuration

- **Frontend**: http://localhost:3000
- **Auth Callback**: http://localhost:3001 (configured in Kite app settings)

## 📚 Tech Stack

- **Framework**: Next.js 16+ with TypeScript
- **UI Library**: React 19 with shadcn/ui components
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Data Fetching**: Native fetch API
- **Spreadsheet**: XLSX for export
- **Validation**: Zod
- **Icons**: Lucide React

## 🐛 Troubleshooting

### "Invalid API credentials"
- Verify API Key and Secret in `.env.local`
- Ensure no extra whitespace
- Check credentials haven't been rotated

### "Invalid redirect URL"
- Confirm `http://localhost:3001/callback` is set in Kite app settings
- URL must match exactly (no trailing slash)
- No `https://` for localhost

### "Port already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use different port
PORT=3001 npm run dev
```

### "Browser doesn't open during auth"
- Copy the URL from terminal output
- Open manually in your browser
- Complete Zerodha login

### "Gemini API errors"
- Verify API key is valid and has quota remaining
- Check internet connection
- Try generating analysis again

## 📖 Additional Resources

- [Zerodha Kite Connect API Docs](https://kite.trade/docs/connect/v3/)
- [Google Gemini API Documentation](https://ai.google.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Component Library](https://ui.shadcn.com/)

## 📝 License

This project is private and intended for personal use only.

## 💡 Tips

- Run `npm run kite-auth` daily (ideally in the morning) as tokens expire
- Sync holdings frequently for accurate real-time data
- Use AI Analysis for portfolio review and decision-making
- Save important analyses from the history tab

---

**Made with ❤️ for Indian investors**
- `npm run kite-auth` - Authenticate with Zerodha Kite
- `npm run lint` - Run ESLint

## Features in Detail

### Portfolio Analytics
- **Sector Allocation**: Visualize your investments across different sectors
- **Performance Metrics**: Track returns, P&L, and portfolio performance
- **Risk Analysis**: Understand your portfolio's risk profile
- **Top Movers**: See your best and worst performing stocks
- **Holdings Heatmap**: Visual representation of your portfolio composition

### AI Analysis
- Get insights about your portfolio diversification
- Receive recommendations for rebalancing
- Understand sector exposure and risks
- View historical analysis results

### Data Integration
- **Zerodha Holdings**: Automatically fetch equity holdings
- **Zerodha Mutual Funds**: Track your mutual fund investments
- **Vested Holdings**: Import US stock holdings

## Configuration

### Kite API Setup

1. Create a Kite Connect app at [developers.kite.trade](https://developers.kite.trade/)
2. Note your API Key and API Secret
3. Add `http://localhost:3001/callback` to redirect URLs
4. Use the `npm run kite-auth` script for daily authentication

### Gemini API Setup

1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to `.env.local` as `GEMINI_API_KEY`

## Troubleshooting

### Authentication Issues
- Ensure redirect URL is configured in Kite app settings
- Check that API credentials are correct in `.env.local`
- Make sure port 3001 is available for the auth callback

### Data Not Loading
- Verify your access token is valid (run `npm run kite-auth` if expired)
- Check browser console for API errors
- Ensure your Zerodha/Vested accounts have holdings

### Port Already in Use
- Change the port in `package.json` or kill the process using port 3000/3001

## Security Notes

- ⚠️ Never commit `.env.local` to version control
- ⚠️ Keep your API keys and secrets secure
- ⚠️ Access tokens expire daily for security
- ✅ All data processing happens locally on your machine

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **AI**: Google Gemini AI
- **APIs**: Zerodha Kite Connect, Vested

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Kite Connect API](https://kite.trade/docs/connect/v3/)
- [Google Gemini AI](https://ai.google.dev/)
- [shadcn/ui](https://ui.shadcn.com/)

## License

This project is for personal use only.

## Contributing

This is a personal portfolio tracker. Feel free to fork and customize for your own use!
