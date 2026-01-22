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
      // Fetch: silent=true (no toast), log by invokeIPC
      const dbProjects = await invokeIPC(window.api.project.list(), { silent: true })
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
    } catch {
      // Error handled by invokeIPC
    } finally {
      set({ loading: false })
    }
  },

  fetchProjectItems: async (projectId: string) => {
    set({ loading: true })
    try {
      // Fetch: silent=true
      const items = await invokeIPC(window.api.project.getItems(projectId), { silent: true })
      set({ activeProjectItems: items as ProjectItem[] })
    } catch {
       // Error handled by invokeIPC
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
      // invokeIPC handles Toast/Log
      await invokeIPC(window.api.project.create(newProject))

      // Refresh list
      await get().fetchProjects()
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Project created',
        description: project.title
      })
    } catch {
       // Error handled by invokeIPC
    }
  },

  updateProjectStatus: async (id, status) => {
    // Optimistic update
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, status } : p))
    }))

    try {
      // invokeIPC handles Toast/Log
      await invokeIPC(window.api.project.updateStatus(id, status))
    } catch {
      // Rollback on error
      // In a real app we might revert the state here
      await get().fetchProjects()
    }
  }
}))
