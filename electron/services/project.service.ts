import { Database } from 'better-sqlite3'
import { getDatabase } from '../database'

export interface Project {
  id: string
  title: string
  status: 'active' | 'pending' | 'completed'
  target_date: string | null
  created_at: string
  updated_at: string
}

export class ProjectService {
  private db: Database

  constructor() {
    this.db = getDatabase()
  }

  createProject(project: Omit<Project, 'created_at' | 'updated_at'>): Project {
    const stmt = this.db.prepare(`
      INSERT INTO projects (id, title, status, target_date)
      VALUES (?, ?, ?, ?)
    `)

    stmt.run(project.id, project.title, project.status, project.target_date)

    return this.getProject(project.id) as Project
  }

  getProject(id: string): Project | undefined {
    return this.db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project | undefined
  }

  listProjects(): Project[] {
    return this.db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all() as Project[]
  }

  updateProjectStatus(id: string, status: string): void {
    const stmt = this.db.prepare(`
      UPDATE projects
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    stmt.run(status, id)
  }

  addItemToProject(projectId: string, noteId: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO project_items (project_id, note_id)
      VALUES (?, ?)
      ON CONFLICT(project_id, note_id) DO NOTHING
    `)
    stmt.run(projectId, noteId)
  }

  getProjectItems(projectId: string): any[] {
    // Join with notes to get details
    const stmt = this.db.prepare(`
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
