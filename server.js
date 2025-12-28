const { createServer: createHttpsServer } = require('https');
const { createServer: createHttpServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

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
let port = 3000;

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
    // Only pass options if using HTTPS factory (HTTP factory ignores first arg usually, or we can wrap it)
    const server = serverFactory(httpsOptions, (req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on ${protocol}://localhost:${port}`);
    });
});
