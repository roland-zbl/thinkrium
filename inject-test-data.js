const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

// 資料庫路徑
const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'knowledge-base-app', 'knowledge-base.db');
const db = new Database(dbPath);

console.log('Inserting test data into:', dbPath);

try {
  // 插入一個模擬訂閱源
  const feedId = 'test-feed-1';
  db.prepare(`
    INSERT OR IGNORE INTO feeds (id, type, url, title)
    VALUES (?, 'rss', 'https://example.com/feed', '測試訂閱源')
  `).run(feedId);

  // 插入一篇文章
  db.prepare(`
    INSERT OR IGNORE INTO feed_items (id, feed_id, guid, title, content, published_at, status)
    VALUES (?, ?, ?, '這是來自資料庫的測試文章', '恭喜！IPC 橋接已成功打通，這是一段從 SQLite 讀取出的內容。', CURRENT_TIMESTAMP, 'unread')
  `).run('test-item-1', feedId, 'guid-1');

  console.log('Success! Test data inserted.');
} catch (err) {
  console.error('Error inserting data:', err);
} finally {
  db.close();
}
