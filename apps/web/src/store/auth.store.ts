import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserResponseDto, UserResponseSchema } from '@kan-todo/types';

interface AuthState {
  user: UserResponseDto | null;
  isAuthenticated: boolean;
  setAuth: (user: UserResponseDto) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      // Convert JSON strings back to Date objects during hydration
      onRehydrateStorage: () => (state) => {
        if (state && state.user) {
          const result = UserResponseSchema.safeParse(state.user);
          if (result.success) {
            state.user = result.data;
          } else {
            // If data is invalid or can't be hydrated, reset to null
            state.user = null;
            state.isAuthenticated = false;
          }
        }
      },
    },
  ),
);
