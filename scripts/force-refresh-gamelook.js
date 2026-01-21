const Database = require('better-sqlite3');
const path = require('path');

// Hardcoded path based on logs
const dbPath = 'C:\\Users\\Roland\\AppData\\Roaming\\knowledge-base-app\\knowledge-base.db';

console.log('Connecting to database at:', dbPath);
let db;
try {
    db = new Database(dbPath);
} catch (error) {
    console.error('Failed to open database. Ensure the app is not locking it appropriately (WAL mode should allow readers/writers).');
    console.error(error);
    process.exit(1);
}

const targetUrl = 'http://www.gamelook.com.cn/feed/';

try {
    const feed = db.prepare('SELECT id, title FROM feeds WHERE url LIKE ?').get(`%${targetUrl}%`);

    if (!feed) {
        console.error('Feed not found!');
        process.exit(1);
    }

    console.log(`Found feed: ${feed.title} (${feed.id})`);

    // 1. Delete existing items
    const deleteRes = db.prepare('DELETE FROM feed_items WHERE feed_id = ?').run(feed.id);
    console.log(`Deleted ${deleteRes.changes} items.`);

    // 2. Reset last_fetched to NULL
    const updateRes = db.prepare('UPDATE feeds SET last_fetched = NULL WHERE id = ?').run(feed.id);
    console.log(`Reset last_fetched status.`);

    console.log('Done. Please RESTART the application to trigger an immediate fetch.');

} catch (e) {
    console.error('Error:', e);
} finally {
    if (db) db.close();
}
