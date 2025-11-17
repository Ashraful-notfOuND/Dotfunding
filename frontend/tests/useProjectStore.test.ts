import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProjectStore } from '../src/hooks/useProjectStore';

describe('useProjectStore - Observer Pattern', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useProjectStore());
    act(() => {
      result.current.setProjects([]);
    });
  });

  it('should initialize with empty projects array', () => {
    const { result } = renderHook(() => useProjectStore());
    
    expect(result.current.projects).toEqual([]);
    expect(result.current.selectedProject).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should set projects', () => {
    const { result } = renderHook(() => useProjectStore());
    
    const mockProjects = [
      { id: '1', title: 'Project 1', fundingCurrent: 1000, fundingGoal: 5000 },
      { id: '2', title: 'Project 2', fundingCurrent: 2000, fundingGoal: 10000 },
    ];

    act(() => {
      result.current.setProjects(mockProjects);
    });

    expect(result.current.projects).toHaveLength(2);
    expect(result.current.projects[0].title).toBe('Project 1');
    expect(result.current.loading).toBe(false);
  });

  it('should select a project by id', () => {
    const { result } = renderHook(() => useProjectStore());
    
    const mockProjects = [
      { id: '1', title: 'Project 1', fundingCurrent: 1000, fundingGoal: 5000 },
      { id: '2', title: 'Project 2', fundingCurrent: 2000, fundingGoal: 10000 },
    ];

    act(() => {
      result.current.setProjects(mockProjects);
      result.current.selectProject('2');
    });

    expect(result.current.selectedProject).not.toBeNull();
    expect(result.current.selectedProject?.id).toBe('2');
    expect(result.current.selectedProject?.title).toBe('Project 2');
  });

  it('should return null when selecting non-existent project', () => {
    const { result } = renderHook(() => useProjectStore());
    
    const mockProjects = [
      { id: '1', title: 'Project 1', fundingCurrent: 1000, fundingGoal: 5000 },
    ];

    act(() => {
      result.current.setProjects(mockProjects);
      result.current.selectProject('999');
    });

    expect(result.current.selectedProject).toBeNull();
  });

  it('should update project funding', () => {
    const { result } = renderHook(() => useProjectStore());
    
    const mockProjects = [
      { id: '1', title: 'Project 1', fundingCurrent: 1000, fundingGoal: 5000 },
    ];

    act(() => {
      result.current.setProjects(mockProjects);
      result.current.updateProjectFunding('1', 500);
    });

    expect(result.current.projects[0].fundingCurrent).toBe(1500);
  });

  it('should not update funding for non-existent project', () => {
    const { result } = renderHook(() => useProjectStore());
    
    const mockProjects = [
      { id: '1', title: 'Project 1', fundingCurrent: 1000, fundingGoal: 5000 },
    ];

    act(() => {
      result.current.setProjects(mockProjects);
      result.current.updateProjectFunding('999', 500);
    });

    expect(result.current.projects[0].fundingCurrent).toBe(1000);
  });

  it('should add a new project', () => {
    const { result } = renderHook(() => useProjectStore());
    
    const initialProjects = [
      { id: '1', title: 'Project 1', fundingCurrent: 1000, fundingGoal: 5000 },
    ];

    const newProject = {
      id: '2',
      title: 'New Project',
      fundingCurrent: 0,
      fundingGoal: 8000,
    };

    act(() => {
      result.current.setProjects(initialProjects);
      result.current.addProject(newProject);
    });

    expect(result.current.projects).toHaveLength(2);
    expect(result.current.projects[1].title).toBe('New Project');
  });

  it('should remove a project', () => {
    const { result } = renderHook(() => useProjectStore());
    
    const mockProjects = [
      { id: '1', title: 'Project 1', fundingCurrent: 1000, fundingGoal: 5000 },
      { id: '2', title: 'Project 2', fundingCurrent: 2000, fundingGoal: 10000 },
    ];

    act(() => {
      result.current.setProjects(mockProjects);
      result.current.removeProject('1');
    });

    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0].id).toBe('2');
  });

  it('should notify observers when state changes', () => {
    const { result } = renderHook(() => useProjectStore());
    
    let callbackCalled = false;
    let receivedProjects: any[] = [];

    // Subscribe to changes
    const unsubscribe = useProjectStore.subscribe(
      (state) => state.projects,
      (projects) => {
        callbackCalled = true;
        receivedProjects = projects;
      }
    );

    const mockProjects = [
      { id: '1', title: 'Project 1', fundingCurrent: 1000, fundingGoal: 5000 },
    ];

    act(() => {
      result.current.setProjects(mockProjects);
    });

    expect(callbackCalled).toBe(true);
    expect(receivedProjects).toHaveLength(1);
    
    unsubscribe();
  });
});
