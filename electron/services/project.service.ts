import { Database } from 'better-sqlite3'
import { getDatabase } from '../database'

export interface Project {
  id: string
  title: string
  status: 'active' | 'pending' | 'completed'
  target_date: string | null
  created_at: string
  updated_at: string
  materialCount: number
  deliverableCount: number
  notes?: string
}

export class ProjectService {
  private db: Database | null = null

  private getDb(): Database {
    if (!this.db) {
      this.db = getDatabase()
    }
    return this.db
  }

  createProject(project: Omit<Project, 'created_at' | 'updated_at'> & { notes?: string }): Project {
    const stmt = this.getDb().prepare(`
      INSERT INTO projects (id, title, status, target_date, notes)
      VALUES (?, ?, ?, ?, ?)
    `)

    stmt.run(
      project.id,
      project.title,
      project.status,
      project.target_date,
      project.notes || ''
    )

    return this.getProject(project.id) as Project
  }

  getProject(id: string): Project | undefined {
    return this.getDb().prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project | undefined
  }

  listProjects(): Project[] {
    const query = `
      SELECT
        p.*,
        COUNT(pi.note_id) as materialCount,
        SUM(CASE WHEN n.tags LIKE '%"deliverable"%' THEN 1 ELSE 0 END) as deliverableCount
      FROM projects p
      LEFT JOIN project_items pi ON p.id = pi.project_id
      LEFT JOIN notes n ON pi.note_id = n.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `
    return this.getDb().prepare(query).all() as Project[]
  }

  updateProjectStatus(id: string, status: string): void {
    const stmt = this.getDb().prepare(`
      UPDATE projects
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    stmt.run(status, id)
  }

  addItemToProject(projectId: string, noteId: string): void {
    const stmt = this.getDb().prepare(`
      INSERT INTO project_items (project_id, note_id)
      VALUES (?, ?)
      ON CONFLICT(project_id, note_id) DO NOTHING
    `)
    stmt.run(projectId, noteId)
  }

  getProjectItems(projectId: string): any[] {
    // Join with notes to get details
    const stmt = this.getDb().prepare(`
      SELECT n.*, pi.added_at
      FROM notes n
      JOIN project_items pi ON n.id = pi.note_id
      WHERE pi.project_id = ?
      ORDER BY pi.added_at DESC
    `)
    return stmt.all(projectId)
  }
}

export const projectService = new ProjectService()
