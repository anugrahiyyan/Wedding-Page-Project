const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {};
const sslDir = path.join(__dirname, 'ssl');
const keyPath = path.join(sslDir, 'server.key');
const certPath = path.join(sslDir, 'server.pem');

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    httpsOptions.key = fs.readFileSync(keyPath);
    httpsOptions.cert = fs.readFileSync(certPath);
} else {
    console.error('Error: SSL certificates not found in ./ssl directory.');
    console.error('Please upload server.key and server.pem via the dashboard settings or place them manually.');
    console.error('Falling back to HTTP on port 3000 (Warning: Secure features may not work)');
    // Fallback to simple http server if needed, or just exit gracefully
    process.exit(1);
}

app.prepare().then(() => {
    createServer(httpsOptions, (req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(3000, (err) => {
        if (err) throw err;
        console.log('> Ready on https://localhost:3000');
    });
});
