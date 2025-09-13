import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  },

  signUp: async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  initialize: () => {
    // Get initial session with timeout and error handling
    Promise.race([
      supabase.auth.getSession(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )
    ]).then((result) => {
      const { data: { session } } = result;
      set({
        session,
        user: session?.user || null,
        loading: false,
      })
    }).catch((error) => {
      console.error('Auth initialization error:', error)
      set({
        session: null,
        user: null,
        loading: false,
      })
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user || null,
        loading: false,
      })
    })

    return () => subscription.unsubscribe()
  },
}))