const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const sqlPath = path.join(__dirname, 'init.sql');

console.log('Opening DB at:', dbPath);

// Create DB if not exists (sqlite3 does this by default)
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
        process.exit(1);
    }
    console.log('Connected to database');
});

const sql = fs.readFileSync(sqlPath, 'utf8');

db.serialize(() => {
    console.log('Running migration...');
    db.exec(sql, (err) => {
        if (err) {
            console.error('Migration failed:', err);
            process.exit(1);
        } else {
            console.log('Migration executed successfully.');
        }
    });
});

db.close((err) => {
    if (err) {
        console.error('Error closing database:', err);
    } else {
        console.log('Database connection closed.');
    }
});
