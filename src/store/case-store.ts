import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { CaseWithDetails, Database } from '@/types/database'

interface CaseState {
  cases: CaseWithDetails[]
  currentCase: CaseWithDetails | null
  loading: boolean
  fetchCases: () => Promise<void>
  fetchCase: (caseId: string) => Promise<void>
  createCase: (caseData: Database['public']['Tables']['cases']['Insert']) => Promise<string>
  sendMessage: (caseId: string, content: string) => Promise<void>
  uploadCasePhoto: (caseId: string, file: File, messageId?: string) => Promise<string>
}

export const useCaseStore = create<CaseState>((set, get) => ({
  cases: [],
  currentCase: null,
  loading: false,

  fetchCases: async () => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          photos:case_photos(*),
          messages:messages(
            *,
            photos:case_photos(*)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ cases: data || [] })
    } catch (error) {
      console.error('Error fetching cases:', error)
    } finally {
      set({ loading: false })
    }
  },

  fetchCase: async (caseId: string) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          photos:case_photos(*),
          messages:messages(
            *,
            photos:case_photos(*)
          )
        `)
        .eq('id', caseId)
        .single()

      if (error) throw error

      set({ currentCase: data })
    } catch (error) {
      console.error('Error fetching case:', error)
    } finally {
      set({ loading: false })
    }
  },

  createCase: async (caseData) => {
    const { data, error } = await supabase
      .from('cases')
      .insert(caseData)
      .select()
      .single()

    if (error) throw error

    // Envoie webhook vers n8n
    if (data) {
      await fetch('/api/webhooks/notify-n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'case_created',
          case_id: data.id,
          case: data
        })
      })
    }

    // Refresh cases list
    await get().fetchCases()

    return data.id
  },

  sendMessage: async (caseId: string, content: string) => {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        case_id: caseId,
        content,
        sender_type: 'user' as const
      })
      .select()
      .single()

    if (error) throw error

    // Envoie webhook vers n8n
    if (data) {
      await fetch('/api/webhooks/notify-n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'message_sent',
          case_id: caseId,
          message_id: data.id,
          message: data
        })
      })
    }

    // Refresh current case
    await get().fetchCase(caseId)
  },

  uploadCasePhoto: async (caseId: string, file: File, messageId?: string) => {
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `cases/${caseId}/${fileName}`

    const { data, error } = await supabase.storage
      .from('case-photos')
      .upload(filePath, file)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('case-photos')
      .getPublicUrl(data.path)

    // Save to database
    const { error: dbError } = await supabase
      .from('case_photos')
      .insert({
        case_id: caseId,
        message_id: messageId || null,
        photo_url: publicUrl
      })

    if (dbError) throw dbError

    return publicUrl
  },
}))