import { create } from 'zustand'
import { Project, ProjectStatus, DbProject, ProjectItem } from '@/types'
import { useToastStore } from '@/stores/toast.store'


interface ProjectState {
  projects: Project[]
  activeProjectItems: ProjectItem[]
  loading: boolean
  fetchProjects: () => Promise<void>
  fetchProjectItems: (projectId: string) => Promise<void>
  createProject: (project: Partial<Project>) => Promise<void>
  updateProjectStatus: (id: string, status: ProjectStatus) => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProjectItems: [],
  loading: false,

  fetchProjects: async () => {
    set({ loading: true })
    try {
      const dbProjects = await window.api.project.list()
      const projects: Project[] = dbProjects.map((p: DbProject) => ({
        id: p.id,
        title: p.title,
        status: p.status as ProjectStatus,
        targetDate: p.target_date,
        materialCount: p.materialCount,
        deliverableCount: p.deliverableCount,
        notes: p.notes || '',
        created_at: p.created_at,
        updated_at: p.updated_at
      }))
      set({ projects })
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to fetch projects',
        description: msg
      })
      console.error('Failed to fetch projects:', error)
    } finally {
      set({ loading: false })
    }
  },

  fetchProjectItems: async (projectId: string) => {
    set({ loading: true })
    try {
      const items = await window.api.project.getItems(projectId)
      set({ activeProjectItems: items as ProjectItem[] })
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to fetch project items',
        description: msg
      })
      console.error('Failed to fetch project items:', error)
    } finally {
      set({ loading: false })
    }
  },

  createProject: async (project) => {
    try {
      const newProject = {
        id: crypto.randomUUID(),
        status: 'active',
        ...project
      }
      await window.api.project.create(newProject)

      // Refresh list
      await get().fetchProjects()
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Project created',
        description: project.title
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to create project',
        description: msg
      })
      console.error('Failed to create project:', error)
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
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to update project status',
        description: msg
      })
      console.error('Failed to update project status:', error)
      // Rollback on error
      // In a real app we might revert the state here
      await get().fetchProjects()
    }
  }
}))
