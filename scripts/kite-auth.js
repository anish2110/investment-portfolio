const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const http = require('http');
const { URL } = require('url');

// Load environment variables from .env.local
function loadEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const [key, ...values] = line.split('=');
            if (key && values.length) {
                process.env[key.trim()] = values.join('=').trim();
            }
        });
    }
}

// Update .env.local file
function updateEnv(key, value) {
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';

    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
    }

    const lines = envContent.split('\n');
    let keyFound = false;

    const updatedLines = lines.map(line => {
        const [lineKey] = line.split('=');
        if (lineKey?.trim() === key) {
            keyFound = true;
            return `${key}=${value}`;
        }
        return line;
    });

    if (!keyFound) {
        updatedLines.push(`${key}=${value}`);
    }

    fs.writeFileSync(envPath, updatedLines.join('\n').trim() + '\n');
    console.log(`✓ Updated ${key} in .env.local`);
}

// Generate checksum for Kite API
function generateChecksum(apiKey, requestToken, apiSecret) {
    const data = apiKey + requestToken + apiSecret;
    return crypto.createHash('sha256').update(data).digest('hex');
}

// Exchange request token for access token
async function getAccessToken(apiKey, apiSecret, requestToken) {
    const url = 'https://api.kite.trade/session/token';
    const checksum = generateChecksum(apiKey, requestToken, apiSecret);

    const body = new URLSearchParams({
        api_key: apiKey,
        request_token: requestToken,
        checksum: checksum,
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`Failed to get access token: ${data.message || JSON.stringify(data)}`);
    }

    return data.data.access_token;
}

// Start local server to capture redirect
function startCallbackServer(apiKey, apiSecret) {
    return new Promise((resolve, reject) => {
        const server = http.createServer(async (req, res) => {
            const parsedUrl = new URL(req.url || '', `http://localhost:3001`);

            if (parsedUrl.pathname === '/callback') {
                const requestToken = parsedUrl.searchParams.get('request_token');
                const status = parsedUrl.searchParams.get('status');

                if (status === 'success' && requestToken) {
                    try {
                        console.log('\n✓ Received request token');
                        console.log('⏳ Exchanging for access token...');

                        const accessToken = await getAccessToken(apiKey, apiSecret, requestToken);

                        updateEnv('KITE_ACCESS_TOKEN', accessToken);

                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(`
              <html>
                <head>
                  <title>Kite Authentication Successful</title>
                  <style>
                    body {
                      font-family: system-ui, -apple-system, sans-serif;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      height: 100vh;
                      margin: 0;
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    }
                    .container {
                      background: white;
                      padding: 3rem;
                      border-radius: 1rem;
                      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                      text-align: center;
                      max-width: 400px;
                    }
                    h1 { color: #10b981; margin: 0 0 1rem 0; }
                    p { color: #6b7280; margin: 0.5rem 0; }
                    .token { 
                      background: #f3f4f6; 
                      padding: 1rem; 
                      border-radius: 0.5rem; 
                      margin: 1rem 0; 
                      word-break: break-all;
                      font-family: monospace;
                      font-size: 0.875rem;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h1>✓ Authentication Successful!</h1>
                    <p>Your Kite access token has been saved to .env.local</p>
                    <div class="token">${accessToken}</div>
                    <p>You can now close this window and return to your terminal.</p>
                  </div>
                </body>
              </html>
            `);

                        setTimeout(() => {
                            server.close();
                            resolve(accessToken);
                        }, 1000);
                    } catch (error) {
                        console.error('✗ Error:', error);
                        res.writeHead(500, { 'Content-Type': 'text/html' });
                        res.end(`
              <html>
                <body>
                  <h1>Authentication Failed</h1>
                  <p>${error.message}</p>
                </body>
              </html>
            `);
                        server.close();
                        reject(error);
                    }
                } else {
                    res.writeHead(400, { 'Content-Type': 'text/html' });
                    res.end(`
            <html>
              <body>
                <h1>Authentication Failed</h1>
                <p>No request token received or authentication was cancelled.</p>
              </body>
            </html>
          `);
                    server.close();
                    reject(new Error('Authentication cancelled or failed'));
                }
            } else {
                res.writeHead(404);
                res.end('Not Found');
            }
        });

        server.listen(3001, () => {
            console.log('✓ Callback server started on http://localhost:3001');
        });

        server.on('error', (error) => {
            console.error('✗ Server error:', error);
            reject(error);
        });
    });
}

// Main function
async function main() {
    console.log('🔐 Kite Authentication Script\n');

    // Load existing environment variables
    loadEnv();

    const apiKey = process.env.KITE_API_KEY;
    const apiSecret = process.env.KITE_API_SECRET;

    if (!apiKey || !apiSecret) {
        console.error('✗ Error: KITE_API_KEY and KITE_API_SECRET must be set in .env.local');
        console.error('\nPlease add them to your .env.local file:');
        console.error('KITE_API_KEY=your_api_key');
        console.error('KITE_API_SECRET=your_api_secret');
        process.exit(1);
    }

    console.log('✓ API Key found:', apiKey);
    console.log('✓ API Secret found:', '*'.repeat(apiSecret.length));
    console.log('\n📝 Steps:');
    console.log('1. A local callback server will start on port 3001');
    console.log('2. Your browser will open the Kite login page');
    console.log('3. Login with your Zerodha credentials');
    console.log('4. Authorize the app');
    console.log('5. The access token will be automatically saved to .env.local\n');

    // Construct login URL with localhost callback
    const loginUrl = `https://kite.zerodha.com/connect/login?api_key=${apiKey}&v=3`;

    console.log('🔗 Login URL:', loginUrl);
    console.log('\n⏳ Starting callback server...\n');

    try {
        // Start callback server
        const serverPromise = startCallbackServer(apiKey, apiSecret);

        // Open browser
        console.log('🌐 Opening browser for authentication...');
        console.log('   If browser does not open automatically, copy and paste the URL above.\n');

        const open = (await import('open')).default;
        await open(loginUrl);

        // Wait for authentication
        const accessToken = await serverPromise;

        console.log('\n✅ Authentication Complete!');
        console.log(`✓ Access token saved to .env.local`);
        console.log('\n🚀 You can now run your application with: npm run dev\n');
    } catch (error) {
        console.error('\n✗ Authentication failed:', error.message);
        process.exit(1);
    }
}

// Run the script
main().catch(error => {
    console.error('✗ Fatal error:', error);
    process.exit(1);
});
