import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '@/lib/utils'

/**
 * @typedef {import('@/data/models').StudentProfile} StudentProfile
 */

export const useProfileStore = create(
  persist(
    (set, get) => ({
      /** @type {StudentProfile | null} */
      profile: null,

      setProfile: (partial) =>
        set((s) => ({
          profile: {
            ...(s.profile || {}),
            ...partial,
            id: s.profile?.id || uid(),
            createdAt: s.profile?.createdAt || new Date().toISOString(),
          },
        })),

      updateProfile: (partial) =>
        set((s) => ({ profile: s.profile ? { ...s.profile, ...partial } : s.profile })),

      completeOnboarding: () =>
        set((s) => ({
          profile: s.profile ? { ...s.profile, onboardingComplete: true } : s.profile,
        })),

      clearProfile: () => set({ profile: null }),

      hasProfile: () => !!get().profile?.onboardingComplete,
    }),
    { name: 'grantly:v1:profile' },
  ),
)
