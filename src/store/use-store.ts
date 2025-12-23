import { create } from 'zustand';
import { designers, inspirations, projects, messages, activityFeed } from '../data/MockData';
import type { Designer, Inspiration, Project, Message, ActivityFeed } from '../data/MockData';

interface SavedIdea {
  id: string;
  savedAt: string;
}

interface AppState {
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Designers
  designers: Designer[];
  selectedDesigner: Designer | null;
  setSelectedDesigner: (designer: Designer | null) => void;

  // Inspirations
  inspirations: Inspiration[];
  savedIdeas: SavedIdea[];
  toggleSaveIdea: (id: string) => void;
  isIdeaSaved: (id: string) => boolean;

  // Projects
  projects: Project[];
  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;

  // Messages
  messages: Message[];
  addMessage: (message: Message) => void;

  // Activity Feed
  activityFeed: ActivityFeed[];

  // Filters
  filters: {
    location: string;
    style: string;
    budgetRange: [number, number];
    rating: number;
  };
  setFilters: (filters: Partial<AppState['filters']>) => void;

  // UI State
  isQuoteModalOpen: boolean;
  setQuoteModalOpen: (open: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Theme
  isDarkMode: false,
  toggleDarkMode: () => {
    set((state) => {
      const newDarkMode = !state.isDarkMode;
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { isDarkMode: newDarkMode };
    });
  },

  // Designers
  designers,
  selectedDesigner: null,
  setSelectedDesigner: (designer) => set({ selectedDesigner: designer }),

  // Inspirations
  inspirations,
  savedIdeas: [],
  toggleSaveIdea: (id) =>
    set((state) => {
      const isSaved = state.savedIdeas.some((idea) => idea.id === id);
      if (isSaved) {
        return { savedIdeas: state.savedIdeas.filter((idea) => idea.id !== id) };
      }
      return { savedIdeas: [...state.savedIdeas, { id, savedAt: new Date().toISOString() }] };
    }),
  isIdeaSaved: (id) => get().savedIdeas.some((idea) => idea.id === id),

  // Projects
  projects,
  activeProject: projects[0] || null,
  setActiveProject: (project) => set({ activeProject: project }),

  // Messages
  messages,
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

  // Activity Feed
  activityFeed,

  // Filters
  filters: {
    location: '',
    style: '',
    budgetRange: [0, 5000000],
    rating: 0,
  },
  setFilters: (newFilters) =>
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),

  // UI State
  isQuoteModalOpen: false,
  setQuoteModalOpen: (open) => set({ isQuoteModalOpen: open }),
}));
