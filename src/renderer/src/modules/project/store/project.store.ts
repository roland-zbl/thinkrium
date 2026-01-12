import { create } from 'zustand'
import { mockProjects } from '../../../mocks'

export type ProjectStatus = 'active' | 'pending' | 'completed'

export interface Project {
  id: string
  title: string
  status: ProjectStatus
  targetDate: string | null
  materialCount: number
  deliverableCount: number
  notes: string
}

interface ProjectState {
  projects: Project[]
  setProjects: (projects: Project[]) => void
  updateProjectStatus: (id: string, status: ProjectStatus) => void
  addProject: (project: Project) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: mockProjects as Project[],
  setProjects: (projects) => set({ projects }),
  updateProjectStatus: (id, status) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, status } : p))
    })),
  addProject: (project) =>
    set((state) => ({
      projects: [project, ...state.projects]
    }))
}))
