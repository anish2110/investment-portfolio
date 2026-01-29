# Investment Portfolio Dashboard

A comprehensive investment portfolio tracking application that integrates with Zerodha (Kite & Coin) and Vested to provide real-time analytics, insights, and AI-powered analysis of your investments.

## Features

- 📊 **Real-time Portfolio Tracking**: View all your holdings from Zerodha and Vested in one place
- 📈 **Advanced Analytics**: Sector allocation, performance metrics, risk analysis, and more
- 🤖 **AI-Powered Insights**: Get intelligent analysis of your portfolio using Google Gemini AI
- 🎨 **Beautiful UI**: Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui
- 🔒 **Local-First**: No authentication required, all data stays on your machine

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Zerodha Kite Connect app (get one at [developers.kite.trade](https://developers.kite.trade/))
- Google Gemini API key (get one at [makersuite.google.com](https://makersuite.google.com/app/apikey))

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd investment-portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Edit `.env.local` and add your credentials:
   ```env
   KITE_API_KEY=your_kite_api_key
   KITE_API_SECRET=your_kite_api_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```

5. **Important**: Configure your Kite app redirect URL:
   - Go to [developers.kite.trade](https://developers.kite.trade/)
   - Edit your app settings
   - Add redirect URL: `http://localhost:3001/callback`

### Authentication

Get your Kite access token (required daily):

```bash
npm run kite-auth
```

This will:
- Open your browser to Kite login
- Handle the OAuth flow automatically
- Save the access token to `.env.local`

**Note**: Kite access tokens expire daily around 3:30 AM IST, so you'll need to run this script each day.

### Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view your portfolio dashboard.

## Project Structure

```
investment-portfolio/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── zerodha/       # Zerodha API endpoints
│   │   │   ├── vested/        # Vested API endpoints
│   │   │   └── ai/            # AI analysis endpoints
│   │   └── page.tsx           # Main dashboard page
│   ├── components/            # React components
│   │   ├── analytics/         # Portfolio analytics components
│   │   └── ui/                # shadcn/ui components
│   └── lib/                   # Utilities and types
├── scripts/
│   ├── kite-auth.js          # Authentication script
│   └── README.md             # Script documentation
└── public/
    └── analyses/             # Saved AI analyses
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
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
