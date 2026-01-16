import { DbNote } from './note'

export type ProjectStatus = 'active' | 'pending' | 'completed'

export interface Project {
  id: string
  title: string
  status: ProjectStatus
  targetDate: string | null
  materialCount: number
  deliverableCount: number
  notes: string
  created_at?: string
  updated_at?: string
}

export interface DbProject {
  id: string
  title: string
  status: string
  target_date: string | null
  materialCount: number
  deliverableCount: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface ProjectItem extends DbNote {
  added_at: string
}
