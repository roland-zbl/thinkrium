import { describe, it, expect, vi, beforeEach } from 'vitest'
import { projectService } from '../services/project.service'
import { getDatabase } from '../database'

// Mock getDatabase
vi.mock('../database', () => {
  const mockDb = {
    prepare: vi.fn(() => ({
      get: vi.fn(),
      run: vi.fn(),
      all: vi.fn()
    })),
    transaction: vi.fn((fn) => (items: any) => fn(items)),
    close: vi.fn()
  }

  return {
    getDatabase: vi.fn(() => mockDb),
    closeDatabase: vi.fn(),
    initDatabase: vi.fn(() => mockDb)
  }
})

describe('Project Service', () => {
  const db = getDatabase()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createProject should insert project and return it', () => {
    const projectInput = {
      id: 'proj-1',
      title: 'New Project',
      status: 'active' as const,
      target_date: null,
      materialCount: 0,
      deliverableCount: 0,
      notes: ''
    }

    const stmtMock = {
      run: vi.fn(),
      get: vi.fn(() => projectInput) // getProject returns this
    }
    vi.spyOn(db, 'prepare').mockReturnValue(stmtMock as any)

    const result = projectService.createProject(projectInput)

    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO projects'))
    expect(stmtMock.run).toHaveBeenCalledWith(
      projectInput.id,
      projectInput.title,
      projectInput.status,
      projectInput.target_date
    )
    expect(result).toEqual(projectInput)
  })

  it('listProjects should return projects with counts', () => {
    const mockProjects = [
      { id: '1', title: 'P1', materialCount: 5, deliverableCount: 2 }
    ]
    const stmtMock = {
      all: vi.fn(() => mockProjects)
    }
    vi.spyOn(db, 'prepare').mockReturnValue(stmtMock as any)

    const projects = projectService.listProjects()

    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT'))
    expect(stmtMock.all).toHaveBeenCalled()
    expect(projects).toEqual(mockProjects)
  })

  it('updateProjectStatus should update status in database', () => {
    const projectId = 'proj-1'
    const newStatus = 'completed'

    const stmtMock = {
      run: vi.fn()
    }
    vi.spyOn(db, 'prepare').mockReturnValue(stmtMock as any)

    projectService.updateProjectStatus(projectId, newStatus)

    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('UPDATE projects'))
    expect(stmtMock.run).toHaveBeenCalledWith(newStatus, projectId)
  })
})
