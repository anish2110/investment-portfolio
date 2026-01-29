# Quick Setup Guide

Follow these steps to get your Investment Portfolio Dashboard up and running.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Get Kite API Credentials

1. Go to [https://developers.kite.trade/](https://developers.kite.trade/)
2. Create a new app or use an existing one
3. Note down:
   - API Key
   - API Secret
4. **Important**: In your app settings, add the redirect URL:
   ```
   http://localhost:3001/callback
   ```

## Step 3: Get Google Gemini API Key

1. Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Copy it for the next step

## Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and fill in your credentials:
   ```env
   KITE_API_KEY=your_api_key_here
   KITE_API_SECRET=your_api_secret_here
   GEMINI_API_KEY=your_gemini_key_here
   ```

## Step 5: Authenticate with Kite

Run the authentication script (you'll need to do this daily):

```bash
npm run kite-auth
```

This will:
- ✅ Open your browser
- ✅ Let you log in to Zerodha
- ✅ Automatically save your access token

## Step 6: Start the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Daily Routine

Since Kite access tokens expire daily, each day you'll need to:

1. Run the auth script:
   ```bash
   npm run kite-auth
   ```

2. Start the app:
   ```bash
   npm run dev
   ```

## Troubleshooting

### "Invalid API credentials"
- Double-check your API key and secret in `.env.local`
- Make sure there are no extra spaces

### "Invalid redirect URL"
- Verify `http://localhost:3001/callback` is added in your Kite app settings
- The URL must be exactly as shown (no trailing slash)

### "Port already in use"
- Kill any process using port 3000 or 3001
- Or modify the ports in the configuration

### Browser doesn't open during auth
- Copy the URL from the terminal
- Paste it manually in your browser
- Complete the login process

## Need Help?

Refer to:
- [Main README](README.md) - Full documentation
- [Scripts README](scripts/README.md) - Authentication script details
- [Kite Connect Docs](https://kite.trade/docs/connect/v3/) - API documentation

## Next Steps

Once running, you can:
- 📊 View your portfolio holdings
- 📈 Analyze sector allocation
- 🤖 Get AI-powered insights
- 📉 Track performance metrics
- 💡 Receive investment recommendations

Enjoy tracking your investments! 🚀
