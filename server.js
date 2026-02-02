const { createServer: createHttpsServer } = require('https');
const { createServer: createHttpServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Get internal IP address (cross-platform: Windows, Linux, macOS)
function getInternalIP() {
    const interfaces = os.networkInterfaces();
    const preferred = ['eth0', 'en0', 'Ethernet', 'Wi-Fi', 'wlan0'];

    // Try preferred interfaces first
    for (const name of preferred) {
        const iface = interfaces[name];
        if (iface) {
            for (const addr of iface) {
                if (addr.family === 'IPv4' && !addr.internal) {
                    return addr.address;
                }
            }
        }
    }

    // Fallback: find any non-internal IPv4 address
    for (const [name, iface] of Object.entries(interfaces)) {
        if (!iface) continue;
        for (const addr of iface) {
            if (addr.family === 'IPv4' && !addr.internal) {
                return addr.address;
            }
        }
    }

    return 'localhost';
}

// Default to production if not explicitly development
const dev = process.env.NODE_ENV === 'development';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {};
const sslDir = path.join(__dirname, 'ssl');
const keyPath = path.join(sslDir, 'server.key');
const certPath = path.join(sslDir, 'server.pem');

let serverFactory = createHttpServer;
let protocol = 'http';
const port = process.env.PORT || 3000;
const internalIP = getInternalIP();
const rootDomain = process.env.ROOT_DOMAIN || `${internalIP}:${port}`;

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    httpsOptions.key = fs.readFileSync(keyPath);
    httpsOptions.cert = fs.readFileSync(certPath);
    serverFactory = (opts, cb) => createHttpsServer(opts, cb);
    protocol = 'https';
    console.log('🔒 SSL Certificates found. Starting secure server...');
} else {
    console.warn('⚠️  SSL certificates not found in ./ssl directory.');
    console.warn('⚠️  Falling back to HTTP. (This is fine for local testing, but use SSL in production)');
    serverFactory = (opts, cb) => createHttpServer(cb); // HTTP ignores options
}

app.prepare().then(() => {
    const server = serverFactory(httpsOptions, (req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    server.listen(port, '0.0.0.0', (err) => {
        if (err) throw err;
        console.log('');
        console.log('┌────────────────────────────────────────────────────┐');
        console.log(`│  🚀 Wedding Page Server                            │`);
        console.log('├────────────────────────────────────────────────────┤');
        console.log(`│  Local:      ${protocol}://localhost:${port}`.padEnd(53) + '│');
        console.log(`│  Network:    ${protocol}://${internalIP}:${port}`.padEnd(53) + '│');
        if (rootDomain && rootDomain !== `${internalIP}:${port}`) {
            console.log(`│  Domain:     ${protocol}://${rootDomain}`.padEnd(53) + '│');
        }
        console.log('├────────────────────────────────────────────────────┤');
        console.log(`│  Environment: ${dev ? 'development' : 'production'}`.padEnd(53) + '│');
        console.log(`│  SSL:         ${protocol === 'https' ? 'enabled ✅' : 'disabled ⚠️'}`.padEnd(53) + '│');
        console.log('└────────────────────────────────────────────────────┘');
        console.log('');
        console.log('💡 Tip: With Cloudflare Tunnel, set ROOT_DOMAIN to your tunnel domain');
        console.log('   and connect via: cloudflared tunnel --url http://localhost:' + port);
        console.log('');
    });
});
