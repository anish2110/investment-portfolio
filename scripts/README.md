# Kite Authentication Script

This script automates the process of obtaining a Kite access token from Zerodha and saving it to your `.env.local` file.

## Prerequisites

1. **Kite API Credentials**: You need to have a Kite Connect app created at [developers.kite.trade](https://developers.kite.trade/)
2. **Redirect URL Configuration**: In your Kite app settings, add the following redirect URL:
   ```
   http://localhost:3001/callback
   ```

## Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Kite API credentials to `.env.local`:
   ```env
   KITE_API_KEY=your_api_key_here
   KITE_API_SECRET=your_api_secret_here
   ```

3. Install the required dependency:
   ```bash
   npm install open
   ```

## Usage

Run the authentication script:

```bash
npm run kite-auth
```

### What happens:

1. ✅ The script loads your API key and secret from `.env.local`
2. ✅ Starts a local callback server on port 3001
3. ✅ Opens your browser to the Kite login page
4. ✅ You log in with your Zerodha credentials and authorize the app
5. ✅ Zerodha redirects back to `http://localhost:3001/callback` with a request token
6. ✅ The script exchanges the request token for an access token
7. ✅ The access token is automatically saved to your `.env.local` file

### Example Output:

```
🔐 Kite Authentication Script

✓ API Key found: your_api_key
✓ API Secret found: ********

📝 Steps:
1. A local callback server will start on port 3001
2. Your browser will open the Kite login page
3. Login with your Zerodha credentials
4. Authorize the app
5. The access token will be automatically saved to .env.local

🔗 Login URL: https://kite.zerodha.com/connect/login?api_key=your_api_key&v=3

⏳ Starting callback server...

✓ Callback server started on http://localhost:3001
🌐 Opening browser for authentication...
   If browser does not open automatically, copy and paste the URL above.

✓ Received request token
⏳ Exchanging for access token...
✓ Updated KITE_ACCESS_TOKEN in .env.local

✅ Authentication Complete!
✓ Access token saved to .env.local

🚀 You can now run your application with: npm run dev
```

## Important Notes

- **Daily Expiry**: Kite access tokens expire at the end of each trading day (around 3:30 AM IST). You'll need to run this script again the next day.
- **Security**: Never commit your `.env.local` file to version control. It's already in `.gitignore`.
- **Port 3001**: Make sure port 3001 is available when running the script.
- **Redirect URL**: The redirect URL `http://localhost:3001/callback` must be registered in your Kite app settings.

## Troubleshooting

### Browser doesn't open automatically
Copy the login URL from the terminal and paste it in your browser manually.

### "Port already in use" error
Make sure no other application is using port 3001, or modify the port in the script.

### "Invalid API credentials" error
Double-check your `KITE_API_KEY` and `KITE_API_SECRET` in `.env.local`.

### "Invalid redirect URL" error
Make sure `http://localhost:3001/callback` is added to your Kite app's redirect URLs.

## Manual Authentication (Alternative)

If you prefer to get the token manually:

1. Open this URL in your browser (replace `YOUR_API_KEY`):
   ```
   https://kite.zerodha.com/connect/login?api_key=YOUR_API_KEY&v=3
   ```

2. Log in and authorize

3. Copy the `request_token` from the redirect URL

4. Use the token to get an access token via the session API endpoint

## Files

- `kite-auth.js` - JavaScript version (recommended, works with Node.js directly)
- `kite-auth.ts` - TypeScript version (requires ts-node)

## Support

For issues with the Kite API itself, refer to:
- [Kite Connect Documentation](https://kite.trade/docs/connect/v3/)
- [Kite Connect API Reference](https://kite.trade/docs/connect/v3/api/)
