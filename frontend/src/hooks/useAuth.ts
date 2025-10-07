import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  setAuth: (user: User | null) => void;
  logout: () => void;
}

const VALID_EMAIL = 'tamimdewan2003@gmail.com';
const VALID_PASSWORD = '1234';

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (email: string, password: string) => {
        if (email === VALID_EMAIL && password === VALID_PASSWORD) {
          set({
            user: {
              id: '123', // 👈 example user id (in real login, comes from backend)
              email: VALID_EMAIL,
              name: 'Tamim Dewan',
            },
            isAuthenticated: true,
          });
          return true;
        }
        return false;
      },
      setAuth: (user: User | null) => set({ user, isAuthenticated: !!user }),
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage', // persisted in localStorage
    }
  )
);
