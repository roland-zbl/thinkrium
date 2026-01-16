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
      const dbProjects = await invokeIPC(window.api.project.list())
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
      // Toast handled by invokeIPC
    } finally {
      set({ loading: false })
    }
  },

  fetchProjectItems: async (projectId: string) => {
    set({ loading: true })
    try {
      const items = await invokeIPC(window.api.project.getItems(projectId))
      set({ activeProjectItems: items as ProjectItem[] })
    } catch (error) {
      console.error('Failed to fetch project items:', error)
      // Toast handled by invokeIPC
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
      await invokeIPC(window.api.project.create(newProject))

      // Refresh list
      await get().fetchProjects()
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Project created',
        description: project.title
      })
    } catch (error) {
      console.error('Failed to create project:', error)
      // Toast handled by invokeIPC
    }
  },

  updateProjectStatus: async (id, status) => {
    // Optimistic update
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, status } : p))
    }))

    try {
      await invokeIPC(window.api.project.updateStatus(id, status))
    } catch (error) {
      console.error('Failed to update project status:', error)
      // Toast handled by invokeIPC
      // Rollback on error
      // In a real app we might revert the state here
      await get().fetchProjects()
    }
  }
}))
