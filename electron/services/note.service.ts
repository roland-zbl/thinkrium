import { net } from 'electron'
import { join, dirname } from 'path'
import { mkdir, writeFile, unlink, rm, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import TurndownService from 'turndown'
import { getDatabase } from '../database'
import { SaveNoteInput, Note, NoteUpdate } from '../../src/renderer/src/modules/note/types'
import { randomUUID } from 'crypto'

export class NoteService {
  private turndown: TurndownService

  constructor() {
    this.turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    })
  }

  /**
   * 獲取設定的筆記根目錄
   */
  async getRootDir(): Promise<string | null> {
    const db = getDatabase()
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('notes.rootDir') as
      | { value: string }
      | undefined
    return row ? row.value : null
  }

  /**
   * 保存筆記
   */
  async saveNote(input: SaveNoteInput): Promise<Note> {
    const rootDir = await this.getRootDir()
    if (!rootDir) {
      throw new Error('未設定筆記存儲目錄')
    }

    const id = randomUUID()
    const now = new Date().toISOString()
    const dateDir = this.getDatePath() // 2024/12
    const safeTitle = this.sanitizeFileName(input.title)
    const relativeNotePath = join('notes', dateDir, `${safeTitle}.md`)
    const absoluteNotePath = join(rootDir, relativeNotePath)
    const absoluteNoteDir = dirname(absoluteNotePath)

    // 1. 確保目錄存在
    if (!existsSync(absoluteNoteDir)) {
      await mkdir(absoluteNoteDir, { recursive: true })
    }

    // 2. 處理圖片並轉換 HTML 為 Markdown
    // 使用 UUID 作為圖片資料夾名稱，避免中文和特殊字符造成路徑問題
    const attachmentsPath = join('attachments', id)
    const absoluteAttachmentsPath = join(rootDir, attachmentsPath)

    const processedHtml = await this.localizeImages(
      input.content,
      absoluteAttachmentsPath,
      attachmentsPath
    )
    const markdownContent = this.turndown.turndown(processedHtml)

    // 3. 生成 Markdown 文件內容
    const frontmatter = {
      id,
      title: input.title,
      date: now,
      source_url: input.sourceUrl || '',
      source_type: input.sourceType,
      tags: input.tags || [],
      aliases: []
    }

    const fileContent = this.generateMarkdownFile(frontmatter, markdownContent, input.personalNote)

    // 4. 寫入文件
    await writeFile(absoluteNotePath, fileContent, 'utf-8')

    // 5. 更新資料庫索引
    const db = getDatabase()
    const note: Note = {
      id,
      title: input.title,
      file_path: relativeNotePath,
      source_url: input.sourceUrl,
      source_type: input.sourceType,
      source_item_id: input.sourceItemId,
      content_text: this.stripMarkdown(markdownContent),
      tags: input.tags || [],
      aliases: [],
      created_at: now,
      updated_at: now
    }

    db.prepare(
      `
      INSERT INTO notes (
        id, title, file_path, source_url, source_type, source_item_id, 
        content_text, tags, aliases, created_at, updated_at
      ) VALUES (
        @id, @title, @file_path, @source_url, @source_type, @source_item_id, 
        @content_text, @tags, @aliases, @created_at, @updated_at
      )
    `
    ).run({
      ...note,
      tags: JSON.stringify(note.tags),
      aliases: JSON.stringify(note.aliases)
    })

    return note
  }

  /**
   * 更新筆記
   */
  async updateNote(id: string, updates: NoteUpdate): Promise<Note> {
    const rootDir = await this.getRootDir()
    if (!rootDir) throw new Error('未設定筆記存儲目錄')

    const db = getDatabase()
    const existing = db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as Note | undefined
    if (!existing) throw new Error('筆記不存在')

    // 1. 如果內容有更新，寫入新內容到 Markdown 文件
    if (updates.content) {
      const absoluteNotePath = join(rootDir, existing.file_path)

      // 注意：這裡簡化了處理，實際應該保留原有的 YAML frontmatter
      // 為了保持簡單，我們先讀取舊文件，提取 frontmatter，再寫入新內容
      const oldFileContent = await readFile(absoluteNotePath, 'utf-8')
      const frontmatterMatch = oldFileContent.match(/^---([\s\S]+?)---/)
      const frontmatter = frontmatterMatch ? frontmatterMatch[0] : ''

      const newFileContent = `${frontmatter}\n\n${updates.content}`
      await writeFile(absoluteNotePath, newFileContent, 'utf-8')
    }

    // 2. 更新資料庫
    const now = new Date().toISOString()
    db.prepare(
      `
      UPDATE notes SET 
        title = COALESCE(@title, title),
        tags = COALESCE(@tags, tags),
        content_text = COALESCE(@content_text, content_text),
        updated_at = @updated_at
      WHERE id = @id
    `
    ).run({
      id,
      title: updates.title || null,
      tags: updates.tags ? JSON.stringify(updates.tags) : null,
      content_text: updates.content ? this.stripMarkdown(updates.content) : null,
      updated_at: now
    })

    const updated = db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as any
    return {
      ...updated,
      tags: JSON.parse(updated.tags || '[]'),
      aliases: JSON.parse(updated.aliases || '[]')
    }
  }

  /**
   * 刪除筆記
   */
  async deleteNote(id: string): Promise<void> {
    const rootDir = await this.getRootDir()
    if (!rootDir) return

    const db = getDatabase()
    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as Note | undefined
    if (!note) return

    // 1. 刪除 Markdown 文件
    const absoluteNotePath = join(rootDir, note.file_path)
    if (existsSync(absoluteNotePath)) {
      await unlink(absoluteNotePath)
    }

    // 2. 刪除附件目錄
    const absoluteAttachmentsPath = join(rootDir, 'attachments', id)
    if (existsSync(absoluteAttachmentsPath)) {
      await rm(absoluteAttachmentsPath, { recursive: true })
    }

    // 3. 刪除資料庫記錄
    db.prepare('DELETE FROM notes WHERE id = ?').run(id)
  }

  /**
   * 將 HTML 中的圖片下載並存儲到本地
   */
  private async localizeImages(
    html: string,
    absoluteDestDir: string,
    relativeDestDir: string
  ): Promise<string> {
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
    let match
    let processedHtml = html

    // 如果有圖片，確保 attachments 目錄存在
    const imagesToDownload: { url: string; fileName: string }[] = []

    while ((match = imgRegex.exec(html)) !== null) {
      const url = match[1]
      const ext = this.getFileExtension(url) || '.jpg'
      const fileName = `${randomUUID()}${ext}`
      imagesToDownload.push({ url, fileName })
    }

    if (imagesToDownload.length > 0 && !existsSync(absoluteDestDir)) {
      await mkdir(absoluteDestDir, { recursive: true })
    }

    for (const item of imagesToDownload) {
      try {
        const response = await net.fetch(item.url)
        if (response.ok) {
          const buffer = await response.arrayBuffer()
          const filePath = join(absoluteDestDir, item.fileName)
          await writeFile(filePath, Buffer.from(buffer))

          // 替換 HTML 中的 URL 為相對路徑
          const relativePath = join(relativeDestDir, item.fileName).replace(/\\/g, '/')
          processedHtml = processedHtml.replace(item.url, relativePath)
        }
      } catch (error) {
        console.error(`Failed to download image: ${item.url}`, error)
      }
    }

    return processedHtml
  }

  private generateMarkdownFile(frontmatter: any, content: string, personalNote?: string): string {
    // 生成標準 YAML frontmatter
    const yamlLines = [
      '---',
      `id: "${frontmatter.id}"`,
      `title: "${frontmatter.title.replace(/"/g, '\\"')}"`,
      `date: ${frontmatter.date}`,
      `source_url: "${frontmatter.source_url || ''}"`,
      `source_type: ${frontmatter.source_type}`,
      `tags: [${(frontmatter.tags || []).map((t: string) => `"${t}"`).join(', ')}]`,
      `aliases: [${(frontmatter.aliases || []).map((a: string) => `"${a}"`).join(', ')}]`,
      '---'
    ]

    const yaml = yamlLines.join('\n')

    return `${yaml}\n\n## 原文內容\n\n${content}\n\n${personalNote ? `## 個人筆記\n\n${personalNote}` : ''}`
  }

  private sanitizeFileName(name: string): string {
    return name.replace(/[\\/:"*?<>|]/g, '_').substring(0, 100)
  }

  private getFileExtension(url: string): string {
    const match = url.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/)
    return match ? `.${match[1]}` : ''
  }

  private getDatePath(): string {
    const now = new Date()
    return join(`${now.getFullYear()}`, `${String(now.getMonth() + 1).padStart(2, '0')}`)
  }

  private stripMarkdown(md: string): string {
    return md.replace(/[#*`_~[\]()]/g, '').substring(0, 2000)
  }
}

export const noteService = new NoteService()
