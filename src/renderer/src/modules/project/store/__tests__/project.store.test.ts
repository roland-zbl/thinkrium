import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useProjectStore } from '../project.store'
import { act } from '@testing-library/react'
import { ProjectStatus } from '@/types'

describe('ProjectStore', () => {
  beforeEach(() => {
    useProjectStore.setState({
      projects: [],
      activeProjectItems: [],
      loading: false
    })
    vi.clearAllMocks()
  })

  describe('fetchProjects', () => {
    it('should fetch and map projects successfully', async () => {
      const mockDbProjects = [
        {
          id: 'p1',
          title: 'Project 1',
          status: 'active',
          target_date: '2023-12-31',
          materialCount: 5,
          deliverableCount: 2,
          notes: 'notes',
          created_at: '2023-01-01',
          updated_at: '2023-01-02'
        }
      ]

      window.api.project.list = vi.fn().mockResolvedValue({ success: true, data: mockDbProjects })

      await act(async () => {
        await useProjectStore.getState().fetchProjects()
      })

      const { projects, loading } = useProjectStore.getState()
      expect(projects).toHaveLength(1)
      expect(projects[0]).toEqual({
        id: 'p1',
        title: 'Project 1',
        status: 'active',
        targetDate: '2023-12-31',
        materialCount: 5,
        deliverableCount: 2,
        notes: 'notes',
        created_at: '2023-01-01',
        updated_at: '2023-01-02'
      })
      expect(loading).toBe(false)
    })

    it('should handle errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      window.api.project.list = vi.fn().mockResolvedValue({ success: false, error: { message: 'Err' } })

      await useProjectStore.getState().fetchProjects()

      expect(useProjectStore.getState().loading).toBe(false)
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('fetchProjectItems', () => {
    it('should fetch items for a project', async () => {
      const mockItems = [{ id: 'n1', title: 'Note 1' }]
      window.api.project.getItems = vi.fn().mockResolvedValue({ success: true, data: mockItems })

      await act(async () => {
        await useProjectStore.getState().fetchProjectItems('p1')
      })

      expect(window.api.project.getItems).toHaveBeenCalledWith('p1')
      expect(useProjectStore.getState().activeProjectItems).toEqual(mockItems)
    })
  })

  describe('createProject', () => {
    it('should create project and refresh list', async () => {
      const mockCreate = vi.fn().mockResolvedValue({ success: true, data: undefined })
      const mockList = vi.fn().mockResolvedValue({ success: true, data: [] })

      window.api.project.create = mockCreate
      window.api.project.list = mockList

      const newProjectData = { title: 'New Proj' }

      await act(async () => {
        await useProjectStore.getState().createProject(newProjectData)
      })

      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Proj',
        status: 'active',
        id: expect.any(String)
      }))
      expect(mockList).toHaveBeenCalled()
    })
  })

  describe('updateProjectStatus', () => {
    it('should optimistically update status', async () => {
      useProjectStore.setState({
        projects: [
          { id: 'p1', title: 'P1', status: 'active' } as any
        ]
      })

      window.api.project.updateStatus = vi.fn().mockResolvedValue({ success: true, data: undefined })

      await act(async () => {
        useProjectStore.getState().updateProjectStatus('p1', 'completed')
      })

      expect(useProjectStore.getState().projects[0].status).toBe('completed')
      expect(window.api.project.updateStatus).toHaveBeenCalledWith('p1', 'completed')
    })

    it('should rollback on error', async () => {
      useProjectStore.setState({
        projects: [
          { id: 'p1', title: 'P1', status: 'active' } as any
        ]
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Mock failure
      window.api.project.updateStatus = vi.fn().mockResolvedValue({ success: false, error: { message: 'Fail' } })
      // Mock list refresh to prove rollback (since the catch block calls fetchProjects)
      // fetchProjects will fetch the "original" state from backend.
      window.api.project.list = vi.fn().mockResolvedValue({
        success: true,
        data: [{ id: 'p1', title: 'P1', status: 'active' }] // Backend still has old status
      })

      await act(async () => {
        await useProjectStore.getState().updateProjectStatus('p1', 'completed')
      })

      // The store catches the error.
      // Optimistic update happened first... then failed... then fetched projects.

      expect(window.api.project.updateStatus).toHaveBeenCalledWith('p1', 'completed')

      // Wait for async operations (fetchProjects)
      expect(useProjectStore.getState().projects[0].status).toBe('active')

      consoleSpy.mockRestore()
    })
  })
})
