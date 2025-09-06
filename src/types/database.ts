export interface Database {
  public: {
    Tables: {
      cases: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          location: unknown // Geography point
          address: string | null
          status: CaseStatus
          category: CaseCategory | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          location?: unknown
          address?: string | null
          status?: CaseStatus
          category?: CaseCategory | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          location?: unknown
          address?: string | null
          status?: CaseStatus
          category?: CaseCategory | null
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          case_id: string
          content: string
          sender_type: SenderType
          sender_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          case_id: string
          content: string
          sender_type: SenderType
          sender_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          content?: string
          sender_type?: SenderType
          sender_id?: string | null
        }
      }
      case_photos: {
        Row: {
          id: string
          case_id: string
          message_id: string | null
          photo_url: string
          created_at: string
        }
        Insert: {
          id?: string
          case_id: string
          message_id?: string | null
          photo_url: string
          created_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          message_id?: string | null
          photo_url?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      case_status: CaseStatus
      case_category: CaseCategory
      sender_type: SenderType
    }
  }
}

export type CaseStatus = 
  | 'nouveau'
  | 'en_cours'
  | 'repondu' 
  | 'resolu'
  | 'ferme'

export type CaseCategory =
  | 'blessure_aile'
  | 'blessure_patte'
  | 'emmele'
  | 'comportement_anormal'
  | 'oisillon'
  | 'autre'

export type SenderType = 'user' | 'expert'

// Types pour l'application
export interface CaseWithDetails {
  id: string
  user_id: string
  title: string
  description: string | null
  location: unknown
  address: string | null
  status: CaseStatus
  category: CaseCategory | null
  created_at: string
  updated_at: string
  photos?: Database['public']['Tables']['case_photos']['Row'][]
  messages?: MessageWithPhotos[]
  unread_count?: number
}

export interface MessageWithPhotos {
  id: string
  case_id: string
  content: string
  sender_type: SenderType
  sender_id: string | null
  created_at: string
  photos?: Database['public']['Tables']['case_photos']['Row'][]
}

export interface Location {
  lat: number
  lng: number
}