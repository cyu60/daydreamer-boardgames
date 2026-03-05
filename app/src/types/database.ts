export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string
          name: string
          bgg_id: string | null
          min_players: number
          max_players: number
          play_time_minutes: number
          image_url: string | null
          description: string | null
          tutorial_url: string | null
          year_published: number | null
          rating: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          bgg_id?: string | null
          min_players: number
          max_players: number
          play_time_minutes: number
          image_url?: string | null
          description?: string | null
          tutorial_url?: string | null
          year_published?: number | null
          rating?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          bgg_id?: string | null
          min_players?: number
          max_players?: number
          play_time_minutes?: number
          image_url?: string | null
          description?: string | null
          tutorial_url?: string | null
          year_published?: number | null
          rating?: number | null
          created_at?: string
        }
      }
      play_sessions: {
        Row: {
          id: string
          game_id: string
          played_at: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          played_at: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          played_at?: string
          notes?: string | null
          created_at?: string
        }
      }
      players: {
        Row: {
          id: string
          name: string
          email: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          created_at?: string
        }
      }
      player_sessions: {
        Row: {
          id: string
          session_id: string
          player_id: string
          score: number | null
          rank: number | null
        }
        Insert: {
          id?: string
          session_id: string
          player_id: string
          score?: number | null
          rank?: number | null
        }
        Update: {
          id?: string
          session_id?: string
          player_id?: string
          score?: number | null
          rank?: number | null
        }
      }
      tonights_picks: {
        Row: {
          id: string
          game_id: string
          pinned_by: string | null
          pinned_at: string
        }
        Insert: {
          id?: string
          game_id: string
          pinned_by?: string | null
          pinned_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          pinned_by?: string | null
          pinned_at?: string
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
      [_ in never]: never
    }
  }
}

// Helper types
export type Game = Database['public']['Tables']['games']['Row']
export type PlaySession = Database['public']['Tables']['play_sessions']['Row']
export type Player = Database['public']['Tables']['players']['Row']
export type PlayerSession = Database['public']['Tables']['player_sessions']['Row']
export type TonightsPick = Database['public']['Tables']['tonights_picks']['Row']
