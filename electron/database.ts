import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

let db: Database.Database | null = null

/**
 * 初始化 SQLite 資料庫
 * - 在 userData 目錄建立或打開 knowledge-base.db
 * - 執行 schema migration
 */
export function initDatabase(): Database.Database {
  if (db) {
    return db
  }

  // 資料庫文件路徑
  const userDataPath = app.getPath('userData')
  const dbPath = join(userDataPath, 'knowledge-base.db')

  console.log('[Database] Initializing database at:', dbPath)

  // 確保目錄存在
  if (!existsSync(userDataPath)) {
    mkdirSync(userDataPath, { recursive: true })
  }

  // 創建或打開資料庫
  db = new Database(dbPath)

  // 啟用 WAL 模式以提升效能
  db.pragma('journal_mode = WAL')

  // 啟用外鍵約束
  db.pragma('foreign_keys = ON')

  // 執行 schema migration
  runMigrations(db)

  // 開發階段：插入種子數據
  seedTestData(db)

  console.log('[Database] Database initialized successfully')
  return db
}

/**
 * 插入測試數據 (Seed Data)
 */
function seedTestData(database: Database.Database): void {
  const feedCount = database.prepare('SELECT COUNT(*) as count FROM feeds').get() as {
    count: number
  }
  if (feedCount.count === 0) {
    console.log('[Database] Seeding test data...')

    // Seed user name
    database
      .prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`)
      .run('user.name', 'Roland')

    const feedId = 'seed-feed-1'
    database
      .prepare(
        `
            INSERT INTO feeds (id, type, url, title)
            VALUES (?, 'rss', 'https://example.com/feed', '開發測試頻道')
        `
      )
      .run(feedId)

    database
      .prepare(
        `
            INSERT INTO feed_items (id, feed_id, guid, title, content, published_at, status)
            VALUES (?, ?, ?, 'IPC 通訊測試成功', '看到這段文字代表從渲染進程透過 IPC 向主進程 SQLite 資料庫請求資料成功！這是一個重大的里程碑。', CURRENT_TIMESTAMP, 'unread')
        `
      )
      .run('seed-item-1', feedId, 'guid-seed-1')

    console.log('[Database] Seed data inserted.')
  }
}

/**
 * 獲取資料庫實例
 * 若尚未初始化則拋出錯誤
 */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

/**
 * 關閉資料庫連接
 */
export function closeDatabase(): void {
  if (db) {
    console.log('[Database] Closing database connection')
    db.close()
    db = null
  }
}

/**
 * 執行資料庫 migration
 */
function runMigrations(database: Database.Database): void {
  console.log('[Database] Running migrations...')

  // 建立 migrations 資料表（如果不存在）
  database.exec(`
        CREATE TABLE IF NOT EXISTS _migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `)

  // 檢查並執行 001_initial_schema
  const migrationName = '001_initial_schema'
  const existing = database.prepare('SELECT id FROM _migrations WHERE name = ?').get(migrationName)

  if (!existing) {
    console.log(`[Database] Applying migration: ${migrationName}`)

    // 內嵌的初始 schema
    const schema = getInitialSchema()
    database.exec(schema)

    // 記錄 migration
    database.prepare('INSERT INTO _migrations (name) VALUES (?)').run(migrationName)
    console.log(`[Database] Migration ${migrationName} applied successfully`)
  } else {
    console.log(`[Database] Migration ${migrationName} already applied`)
  }

  // 檢查並執行 002_notes_schema
  const migrationNoteName = '002_notes_schema'
  const existingNote = database
    .prepare('SELECT id FROM _migrations WHERE name = ?')
    .get(migrationNoteName)

  if (!existingNote) {
    console.log(`[Database] Applying migration: ${migrationNoteName}`)

    const schema = getNoteSchema()
    database.exec(schema)

    database.prepare('INSERT INTO _migrations (name) VALUES (?)').run(migrationNoteName)
    console.log(`[Database] Migration ${migrationNoteName} applied successfully`)
  } else {
    console.log(`[Database] Migration ${migrationNoteName} already applied`)
  }

  // 檢查並執行 003_projects_schema
  const migrationProjectName = '003_projects_schema'
  const existingProject = database
    .prepare('SELECT id FROM _migrations WHERE name = ?')
    .get(migrationProjectName)

  if (!existingProject) {
    console.log(`[Database] Applying migration: ${migrationProjectName}`)

    const schema = getProjectSchema()
    database.exec(schema)

    database.prepare('INSERT INTO _migrations (name) VALUES (?)').run(migrationProjectName)
    console.log(`[Database] Migration ${migrationProjectName} applied successfully`)
  } else {
    console.log(`[Database] Migration ${migrationProjectName} already applied`)
  }
}

/**
 * 獲取 Project 模組的 schema SQL
 */
function getProjectSchema(): string {
  return `
        -- 專案表
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            target_date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- 專案項目關聯表
        CREATE TABLE IF NOT EXISTS project_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id TEXT NOT NULL,
            note_id TEXT NOT NULL,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
            UNIQUE(project_id, note_id)
        );

        -- 索引
        CREATE INDEX IF NOT EXISTS idx_project_items_project_id ON project_items(project_id);
        CREATE INDEX IF NOT EXISTS idx_project_items_note_id ON project_items(note_id);
    `
}

/**
 * 獲取初始 schema SQL
 */
function getInitialSchema(): string {
  return `
        -- 訂閱源表
        CREATE TABLE IF NOT EXISTS feeds (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL DEFAULT 'rss',
            url TEXT NOT NULL,
            title TEXT,
            icon_url TEXT,
            last_fetched DATETIME,
            fetch_interval INTEGER DEFAULT 30,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- 內容項目表
        CREATE TABLE IF NOT EXISTS feed_items (
            id TEXT PRIMARY KEY,
            feed_id TEXT NOT NULL,
            guid TEXT,
            title TEXT NOT NULL,
            url TEXT,
            content TEXT,
            author TEXT,
            published_at DATETIME,
            fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'unread',
            read_at DATETIME,
            FOREIGN KEY (feed_id) REFERENCES feeds(id) ON DELETE CASCADE
        );

        -- 創建索引
        CREATE INDEX IF NOT EXISTS idx_feed_items_feed_id ON feed_items(feed_id);
        CREATE INDEX IF NOT EXISTS idx_feed_items_status ON feed_items(status);
        CREATE INDEX IF NOT EXISTS idx_feed_items_published ON feed_items(published_at DESC);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_feed_items_guid ON feed_items(feed_id, guid);
    `
}

/**
 * 獲取 Note 模組的 schema SQL
 */
function getNoteSchema(): string {
  return `
        -- 筆記索引表
        CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            file_path TEXT NOT NULL UNIQUE,
            source_url TEXT,
            source_type TEXT DEFAULT 'manual',
            source_item_id TEXT,
            content_text TEXT,
            tags TEXT,
            aliases TEXT,
            outgoing_links TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            file_modified_at DATETIME,
            FOREIGN KEY (source_item_id) REFERENCES feed_items(id) ON DELETE SET NULL
        );

        -- 雙鏈關係表
        CREATE TABLE IF NOT EXISTS note_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            from_note_id TEXT NOT NULL,
            to_note_id TEXT NOT NULL,
            link_text TEXT,
            context TEXT,
            FOREIGN KEY (from_note_id) REFERENCES notes(id) ON DELETE CASCADE,
            FOREIGN KEY (to_note_id) REFERENCES notes(id) ON DELETE CASCADE
        );

        -- 全文搜索索引
        CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
            title, content_text, tags,
            content='notes',
            content_rowid='rowid'
        );

        -- 設定表
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );
    `
}
