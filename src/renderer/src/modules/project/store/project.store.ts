import { create } from 'zustand'
import { Project, ProjectStatus, DbProject, ProjectItem } from '@/types'
import { useToastStore } from '@/stores/toast.store'
import { invokeIPC } from '@/utils/ipc'


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
      const dbProjects = await invokeIPC(window.api.project.list(), { showErrorToast: false })
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
      console.error('Failed to fetch projects:', error)
      // Silent error for fetch
    } finally {
      set({ loading: false })
    }
  },

  fetchProjectItems: async (projectId: string) => {
    set({ loading: true })
    try {
      const items = await invokeIPC(window.api.project.getItems(projectId), { showErrorToast: false })
      set({ activeProjectItems: items as ProjectItem[] })
    } catch (error) {
      console.error('Failed to fetch project items:', error)
      // Silent error for fetch
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
      await invokeIPC(window.api.project.create(newProject), { showErrorToast: false })

      // Refresh list
      await get().fetchProjects()
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Project created',
        description: project.title
      })
    } catch (error) {
      console.error('Failed to create project:', error)
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to create project',
        description: msg
      })
    }
  },

  updateProjectStatus: async (id, status) => {
    // Optimistic update
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, status } : p))
    }))

    try {
      await invokeIPC(window.api.project.updateStatus(id, status), { showErrorToast: false })
    } catch (error) {
      console.error('Failed to update project status:', error)
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to update project status',
        description: msg
      })
      // Rollback on error
      // In a real app we might revert the state here
      await get().fetchProjects()
    }
  }
}))
