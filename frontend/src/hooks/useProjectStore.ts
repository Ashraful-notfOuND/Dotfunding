import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

interface Project {
  id: string;
  title: string;
  fundingCurrent: number;
  fundingGoal: number;
  [key: string]: any;
}

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  error: string | null;
}

interface ProjectActions {
  setProjects: (projects: Project[]) => void;
  selectProject: (id: string) => void;
  updateProjectFunding: (id: string, amount: number) => void;
  addProject: (project: Project) => void;
  removeProject: (id: string) => void;
}

type ProjectStore = ProjectState & ProjectActions;

export const useProjectStore = create<ProjectStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // State
      projects: [],
      selectedProject: null,
      loading: false,
      error: null,

      // Actions
      setProjects: (projects) => 
        set({ projects, loading: false }),

      selectProject: (id) => 
        set((state) => ({
          selectedProject: state.projects.find(p => p.id === id) || null
        })),

      updateProjectFunding: (id, amount) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, fundingCurrent: p.fundingCurrent + amount }
              : p
          ),
        })),

      addProject: (project) =>
        set((state) => ({
          projects: [...state.projects, project],
        })),

      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),
    }))
  )
);

// Observer utility for logging state changes
export const subscribeToProjects = (callback: (projects: Project[]) => void) => {
  return useProjectStore.subscribe(
    (state) => state.projects,
    callback,
    { fireImmediately: true }
  );
};
