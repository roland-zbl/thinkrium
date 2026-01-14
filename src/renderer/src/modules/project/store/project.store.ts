import { create } from 'zustand'

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

interface ProjectState {
  projects: Project[]
  loading: boolean
  fetchProjects: () => Promise<void>
  addProject: (title: string, targetDate?: string | null) => Promise<void>
  updateProjectStatus: (id: string, status: ProjectStatus) => void // TODO: Implement backend update
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,

  fetchProjects: async () => {
    set({ loading: true })
    try {
      const dbProjects = await window.api.project.list()
      // Map DB projects to frontend Project interface
      // Note: materialCount and deliverableCount need to be calculated or fetched.
      // For now we set them to 0 or we need another API to get stats.
      const projects: Project[] = await Promise.all(
        dbProjects.map(async (p: any) => {
          // Optional: Fetch item counts for each project
          // const items = await window.api.project.getItems(p.id)
          // const materialCount = items.length
          return {
            id: p.id,
            title: p.title,
            status: p.status as ProjectStatus,
            targetDate: p.target_date,
            materialCount: 0, // TODO: Implement count
            deliverableCount: 0, // TODO: Implement count
            notes: '', // TODO: DB does not have notes column for project itself yet
            created_at: p.created_at,
            updated_at: p.updated_at
          }
        })
      )
      set({ projects })
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      set({ loading: false })
    }
  },

  addProject: async (title, targetDate) => {
    try {
      const id = crypto.randomUUID()
      await window.api.project.create({
        id,
        title,
        status: 'active',
        target_date: targetDate || null
      })

      // Refresh list
      await get().fetchProjects()
    } catch (error) {
      console.error('Failed to add project:', error)
    }
  },

  updateProjectStatus: async (id, status) => {
    // Optimistic update
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, status } : p))
    }))

    try {
      await window.api.project.updateStatus(id, status)
    } catch (error) {
      console.error('Failed to update project status:', error)
      // Rollback on error
      // In a real app we might revert the state here
      await get().fetchProjects()
    }
  }
}))
