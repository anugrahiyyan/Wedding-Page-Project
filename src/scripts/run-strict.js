const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const envLocalPath = path.join(process.cwd(), '.env.local');
const tempEnvPath = path.join(process.cwd(), '_env.local_temp');
let renamed = false;

// Get command from arguments (e.g., node run-strict.js next start)
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('Usage: node src/scripts/run-strict.js <command> [args...]');
    process.exit(1);
}

// Function to restore .env.local if it was renamed
function cleanup() {
    if (renamed && fs.existsSync(tempEnvPath)) {
        try {
            fs.renameSync(tempEnvPath, envLocalPath);
            console.log('\nRestored .env.local');
        } catch (e) {
            console.error('\nFailed to restore .env.local:', e);
        }
        renamed = false;
    }
}

// Handle exit signals to ensure cleanup
// We need to handle SIGINT (Ctrl+C) specifically for long running processes like 'next start'
process.on('SIGINT', () => {
    cleanup();
    process.exit(0);
});
process.on('SIGTERM', () => {
    cleanup();
    process.exit(0);
});
process.on('exit', () => cleanup());

async function run() {
    // 1. Rename .env.local if it exists
    if (fs.existsSync(envLocalPath)) {
        try {
            fs.renameSync(envLocalPath, tempEnvPath);
            renamed = true;
            console.log('Temporarily hid .env.local for strict execution...');
        } catch (e) {
            console.error('Error renaming .env.local:', e);
            process.exit(1);
        }
    } else {
        console.log('No .env.local found, proceeding...');
    }

    // 2. Run the command
    const command = args[0];
    const commandArgs = args.slice(1);
    const cmdExecutable = process.platform === 'win32' && !command.endsWith('.cmd') && !command.endsWith('.exe') ? `${command}.cmd` : command;

    // Use npx if the command is not a direct path/executable and likely a package script
    // Actually, simple spawn usually requires full handling. 
    // To make it robust for 'next', we can try spawning 'npx' or finding the bin.
    // Simplifying: The user will likely pass 'next' or similar. 
    // Let's rely on shell execution for simplicity and path resolution.

    // Better approach matching build-prod.js: use npx for package commands
    // But we want it generic. If args is ['next', 'start'], we can run `npx next start`.

    const finalCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const finalArgs = [command, ...commandArgs];

    const child = spawn(finalCmd, finalArgs, {
        stdio: 'inherit',
        shell: true
    });

    child.on('close', (code) => {
        // Cleanup is handled by process.on('exit')
        process.exit(code);
    });
}

run();
