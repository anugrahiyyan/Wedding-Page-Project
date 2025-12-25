const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const envLocalPath = path.join(process.cwd(), '.env.local');
const tempEnvPath = path.join(process.cwd(), '_env.local_temp');
let renamed = false;

// Function to restore .env.local if it was renamed
function cleanup() {
    if (renamed && fs.existsSync(tempEnvPath)) {
        try {
            fs.renameSync(tempEnvPath, envLocalPath);
            console.log('Restored .env.local');
        } catch (e) {
            console.error('Failed to restore .env.local:', e);
        }
    }
}

// Handle exit signals to ensure cleanup
process.on('SIGINT', () => { cleanup(); process.exit(); });
process.on('SIGTERM', () => { cleanup(); process.exit(); });
process.on('exit', () => cleanup());

async function build() {
    // 1. Rename .env.local if it exists
    if (fs.existsSync(envLocalPath)) {
        try {
            fs.renameSync(envLocalPath, tempEnvPath);
            renamed = true;
            console.log('Temporarily hid .env.local for production build...');
        } catch (e) {
            console.error('Error renaming .env.local:', e);
            process.exit(1);
        }
    } else {
        console.log('No .env.local found, proceeding with build...');
    }

    // 2. Run next build
    const buildCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const child = spawn(buildCmd, ['next', 'build'], {
        stdio: 'inherit',
        shell: true
    });

    child.on('close', (code) => {
        // Cleanup is handled by process.on('exit')
        process.exit(code);
    });
}

build();
