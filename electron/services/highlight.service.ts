import { Database } from 'better-sqlite3'
import { getDatabase } from '../database'
import { CreateHighlightDTO, Highlight, UpdateHighlightDTO } from '@shared/types/feed'

export class HighlightService {
  private db: Database | null = null

  private getDb(): Database {
    if (!this.db) {
      this.db = getDatabase()
    }
    return this.db
  }

  createHighlight(data: CreateHighlightDTO): void {
    const stmt = this.getDb().prepare(`
      INSERT INTO highlights (id, feed_item_id, text, note, color, start_offset, end_offset)
      VALUES (@id, @feed_item_id, @text, @note, @color, @start_offset, @end_offset)
    `)
    stmt.run({ ...data, note: data.note || null })
  }

  updateHighlight(data: UpdateHighlightDTO): void {
    const sets: string[] = []
    const params: any = { id: data.id }

    if (data.note !== undefined) {
      sets.push('note = @note')
      params.note = data.note
    }

    if (data.color !== undefined) {
      sets.push('color = @color')
      params.color = data.color
    }

    if (sets.length === 0) return

    const stmt = this.getDb().prepare(`
      UPDATE highlights SET ${sets.join(', ')} WHERE id = @id
    `)
    stmt.run(params)
  }

  deleteHighlight(id: string): void {
    const stmt = this.getDb().prepare('DELETE FROM highlights WHERE id = ?')
    stmt.run(id)
  }

  getHighlightsByItem(feedItemId: string): Highlight[] {
    const stmt = this.getDb().prepare(`
      SELECT * FROM highlights
      WHERE feed_item_id = ?
      ORDER BY start_offset ASC
    `)
    return stmt.all(feedItemId) as Highlight[]
  }

  getAllHighlights(): Highlight[] {
    const stmt = this.getDb().prepare(`
      SELECT * FROM highlights
      ORDER BY created_at DESC
    `)
    return stmt.all() as Highlight[]
  }
}

export const highlightService = new HighlightService()
