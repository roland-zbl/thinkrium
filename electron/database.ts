import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { randomUUID } from 'crypto'
import log from './utils/logger'

let db: Database.Database | null = null

/**
 * 初始化 SQLite 資料庫
 * - 在 userData 目錄建立或打開 knowledge-base.db
 * - 執行 schema migration
 */
export function initDatabase(filename?: string, _skipSeed = false): Database.Database {
  if (db) {
    return db
  }

  // 資料庫文件路徑
  let dbPath = filename
  if (!dbPath) {
    const userDataPath = app.getPath('userData')
    dbPath = join(userDataPath, 'knowledge-base.db')

    log.info('[Database] Initializing database at:', dbPath)

    // 確保目錄存在
    if (!existsSync(userDataPath)) {
      mkdirSync(userDataPath, { recursive: true })
    }
  } else {
    log.info('[Database] Initializing database at:', dbPath)
  }

  // 創建或打開資料庫
  db = new Database(dbPath)

  // 啟用 WAL 模式以提升效能
  db.pragma('journal_mode = WAL')

  // 啟用外鍵約束
  db.pragma('foreign_keys = ON')

  // 執行 schema migration
  runMigrations(db)

  // Explicitly check for feed_items_fts existence after migration for debugging/verification
  try {
      const ftsCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='feed_items_fts'").get();
      if (ftsCheck) {
          log.info('[Database] Verified: feed_items_fts table exists.');
      } else {
          log.error('[Database] WARNING: feed_items_fts table does NOT exist after migration.');
      }
  } catch (e) {
      log.error('[Database] Failed to verify feed_items_fts existence:', e);
  }

  log.info('[Database] Database initialized successfully')
  return db
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
    log.info('[Database] Closing database connection')
    db.close()
    db = null
  }
}

/**
 * 執行資料庫 migration
 */
function runMigrations(database: Database.Database): void {
  log.info('[Database] Running migrations...')

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
    log.info(`[Database] Applying migration: ${migrationName}`)

    // 內嵌的初始 schema
    const schema = getInitialSchema()
    database.exec(schema)

    // 記錄 migration
    database.prepare('INSERT INTO _migrations (name) VALUES (?)').run(migrationName)
    log.info(`[Database] Migration ${migrationName} applied successfully`)
  } else {
    log.info(`[Database] Migration ${migrationName} already applied`)
  }

  // 檢查並執行 002_notes_schema
  const migrationNoteName = '002_notes_schema'
  const existingNote = database
    .prepare('SELECT id FROM _migrations WHERE name = ?')
    .get(migrationNoteName)

  if (!existingNote) {
    log.info(`[Database] Applying migration: ${migrationNoteName}`)

    const schema = getNoteSchema()
    database.exec(schema)

    database.prepare('INSERT INTO _migrations (name) VALUES (?)').run(migrationNoteName)
    log.info(`[Database] Migration ${migrationNoteName} applied successfully`)
  } else {
    log.info(`[Database] Migration ${migrationNoteName} already applied`)
  }

  // 檢查並執行 003_projects_schema
  const migrationProjectName = '003_projects_schema'
  const existingProject = database
    .prepare('SELECT id FROM _migrations WHERE name = ?')
    .get(migrationProjectName)

  if (!existingProject) {
    log.info(`[Database] Applying migration: ${migrationProjectName}`)

    const schema = getProjectSchema()
    database.exec(schema)

    database.prepare('INSERT INTO _migrations (name) VALUES (?)').run(migrationProjectName)
    log.info(`[Database] Migration ${migrationProjectName} applied successfully`)
  } else {
    log.info(`[Database] Migration ${migrationProjectName} already applied`)
  }

  // 檢查並執行 004_schema_updates
  const migrationSchemaUpdateName = '004_schema_updates'
  const existingSchemaUpdate = database
    .prepare('SELECT id FROM _migrations WHERE name = ?')
    .get(migrationSchemaUpdateName)

  if (!existingSchemaUpdate) {
    log.info(`[Database] Applying migration: ${migrationSchemaUpdateName}`)

    // 執行 schema updates
    try {
      database.exec(`
        ALTER TABLE projects ADD COLUMN notes TEXT DEFAULT '';
        ALTER TABLE feeds ADD COLUMN category TEXT DEFAULT '未分類';
      `)
      database.prepare('INSERT INTO _migrations (name) VALUES (?)').run(migrationSchemaUpdateName)
      log.info(`[Database] Migration ${migrationSchemaUpdateName} applied successfully`)
    } catch (error) {
      log.error(`[Database] Migration ${migrationSchemaUpdateName} failed:`, error)
    }
  } else {
    log.info(`[Database] Migration ${migrationSchemaUpdateName} already applied`)
  }

  // 檢查並執行 005_add_quick_note
  const migrationQuickNoteName = '005_add_quick_note'
  const existingQuickNote = database
    .prepare('SELECT id FROM _migrations WHERE name = ?')
    .get(migrationQuickNoteName)

  if (!existingQuickNote) {
    log.info(`[Database] Applying migration: ${migrationQuickNoteName}`)
    try {
      database.exec(`
        ALTER TABLE feed_items ADD COLUMN quick_note TEXT;
      `)
      database.prepare('INSERT INTO _migrations (name) VALUES (?)').run(migrationQuickNoteName)
      log.info(`[Database] Migration ${migrationQuickNoteName} applied successfully`)
    } catch (error) {
      log.error(`[Database] Migration ${migrationQuickNoteName} failed:`, error)
    }
  } else {
    log.info(`[Database] Migration ${migrationQuickNoteName} already applied`)
  }

  // 006_feed_folders
  const migrationFeedFoldersName = '006_feed_folders'
  const existingFeedFolders = database
    .prepare('SELECT id FROM _migrations WHERE name = ?')
    .get(migrationFeedFoldersName)

  if (!existingFeedFolders) {
    log.info(`[Database] Applying migration: ${migrationFeedFoldersName}`)
    try {
      // 1. Create folders table
      database.exec(`
        CREATE TABLE IF NOT EXISTS folders (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            parent_id TEXT,
            position INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
        );
      `)

      // 2. Add folder_id to feeds
      database.exec(`
        ALTER TABLE feeds ADD COLUMN folder_id TEXT;
      `)

      // 3. Migrate categories to folders
      const categories = database
        .prepare(
          "SELECT DISTINCT category FROM feeds WHERE category IS NOT NULL AND category != '未分類'"
        )
        .all() as { category: string }[]

      const insertFolder = database.prepare('INSERT INTO folders (id, name) VALUES (?, ?)')
      const updateFeed = database.prepare('UPDATE feeds SET folder_id = ? WHERE category = ?')

      for (const cat of categories) {
        const folderId = randomUUID()
        insertFolder.run(folderId, cat.category)
        updateFeed.run(folderId, cat.category)
      }

      database.prepare('INSERT INTO _migrations (name) VALUES (?)').run(migrationFeedFoldersName)
      log.info(`[Database] Migration ${migrationFeedFoldersName} applied successfully`)
    } catch (error) {
      log.error(`[Database] Migration ${migrationFeedFoldersName} failed:`, error)
    }
  } else {
    log.info(`[Database] Migration ${migrationFeedFoldersName} already applied`)
  }

  // 007_feed_search
  const migrationFeedSearchName = '007_feed_search'
  const existingFeedSearch = database
    .prepare('SELECT id FROM _migrations WHERE name = ?')
    .get(migrationFeedSearchName)

  if (!existingFeedSearch) {
    log.info(`[Database] Applying migration: ${migrationFeedSearchName}`)
    try {
      // 1. Create FTS virtual table
      // Note: content_rowid='rowid' links to the implicit rowid of feed_items
      database.exec(`
        CREATE VIRTUAL TABLE IF NOT EXISTS feed_items_fts USING fts5(
            title,
            content,
            author,
            content='feed_items',
            content_rowid='rowid',
            tokenize='trigram'
        );
      `)

      // 2. Create triggers to keep FTS in sync
      database.exec(`
        CREATE TRIGGER IF NOT EXISTS feed_items_ai AFTER INSERT ON feed_items BEGIN
          INSERT INTO feed_items_fts(rowid, title, content, author) VALUES (new.rowid, new.title, new.content, new.author);
        END;

        CREATE TRIGGER IF NOT EXISTS feed_items_ad AFTER DELETE ON feed_items BEGIN
          INSERT INTO feed_items_fts(feed_items_fts, rowid, title, content, author) VALUES('delete', old.rowid, old.title, old.content, old.author);
        END;

        CREATE TRIGGER IF NOT EXISTS feed_items_au AFTER UPDATE ON feed_items BEGIN
          INSERT INTO feed_items_fts(feed_items_fts, rowid, title, content, author) VALUES('delete', old.rowid, old.title, old.content, old.author);
          INSERT INTO feed_items_fts(rowid, title, content, author) VALUES (new.rowid, new.title, new.content, new.author);
        END;
      `)

      // 3. Populate existing data
      // For external content tables, 'rebuild' scans the content table and builds the index
      database.exec("INSERT INTO feed_items_fts(feed_items_fts) VALUES('rebuild')")

      database.prepare('INSERT INTO _migrations (name) VALUES (?)').run(migrationFeedSearchName)
      log.info(`[Database] Migration ${migrationFeedSearchName} applied successfully`)
    } catch (error) {
      log.error(`[Database] Migration ${migrationFeedSearchName} failed:`, error)
      // Fallback: If trigram is not supported, try standard tokenizer
      if (String(error).includes('tokenizer')) {
        log.info('[Database] Retrying migration with standard tokenizer...')
        try {
           database.exec(`
            CREATE VIRTUAL TABLE IF NOT EXISTS feed_items_fts USING fts5(
                title,
                content,
                author,
                content='feed_items',
                content_rowid='rowid'
            );
            -- (Re-create triggers and rebuild...)
            CREATE TRIGGER IF NOT EXISTS feed_items_ai AFTER INSERT ON feed_items BEGIN
              INSERT INTO feed_items_fts(rowid, title, content, author) VALUES (new.rowid, new.title, new.content, new.author);
            END;
            CREATE TRIGGER IF NOT EXISTS feed_items_ad AFTER DELETE ON feed_items BEGIN
              INSERT INTO feed_items_fts(feed_items_fts, rowid, title, content, author) VALUES('delete', old.rowid, old.title, old.content, old.author);
            END;
            CREATE TRIGGER IF NOT EXISTS feed_items_au AFTER UPDATE ON feed_items BEGIN
              INSERT INTO feed_items_fts(feed_items_fts, rowid, title, content, author) VALUES('delete', old.rowid, old.title, old.content, old.author);
              INSERT INTO feed_items_fts(rowid, title, content, author) VALUES (new.rowid, new.title, new.content, new.author);
            END;
            INSERT INTO feed_items_fts(feed_items_fts) VALUES('rebuild');
           `)
           database.prepare('INSERT INTO _migrations (name) VALUES (?)').run(migrationFeedSearchName)
           log.info(`[Database] Migration ${migrationFeedSearchName} applied successfully (fallback)`)
        } catch (retryError) {
           log.error(`[Database] Migration ${migrationFeedSearchName} failed even with fallback:`, retryError)
        }
      }
    }
  } else {
    log.info(`[Database] Migration ${migrationFeedSearchName} already applied`)
  }

  // 008_highlights
  const migrationHighlightsName = '008_highlights'
  const existingHighlights = database
    .prepare('SELECT id FROM _migrations WHERE name = ?')
    .get(migrationHighlightsName)

  if (!existingHighlights) {
    log.info(`[Database] Applying migration: ${migrationHighlightsName}`)
    try {
      database.exec(`
        CREATE TABLE IF NOT EXISTS highlights (
          id TEXT PRIMARY KEY,
          feed_item_id TEXT NOT NULL,
          text TEXT NOT NULL,
          note TEXT,
          color TEXT DEFAULT 'yellow',
          start_offset INTEGER NOT NULL,
          end_offset INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (feed_item_id) REFERENCES feed_items(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_highlights_feed_item_id ON highlights(feed_item_id);
      `)
      database.prepare('INSERT INTO _migrations (name) VALUES (?)').run(migrationHighlightsName)
      log.info(`[Database] Migration ${migrationHighlightsName} applied successfully`)
    } catch (error) {
      log.error(`[Database] Migration ${migrationHighlightsName} failed:`, error)
    }
  } else {
    log.info(`[Database] Migration ${migrationHighlightsName} already applied`)
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
