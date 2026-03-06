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
      votes: {
        Row: {
          id: string
          game_id: string
          voter_name: string
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          voter_name: string
          created_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          voter_name?: string
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          slug: string
          name: string | null
          host_name: string
          status: 'voting' | 'playing' | 'completed'
          created_at: string
          started_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          name?: string | null
          host_name: string
          status?: 'voting' | 'playing' | 'completed'
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          slug?: string
          name?: string | null
          host_name?: string
          status?: 'voting' | 'playing' | 'completed'
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
        }
      }
      session_games: {
        Row: {
          id: string
          session_id: string
          game_id: string
          added_at: string
        }
        Insert: {
          id?: string
          session_id: string
          game_id: string
          added_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          game_id?: string
          added_at?: string
        }
      }
      session_votes: {
        Row: {
          id: string
          session_id: string
          game_id: string
          voter_name: string
          rank: number | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          game_id: string
          voter_name: string
          rank?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          game_id?: string
          voter_name?: string
          rank?: number | null
          created_at?: string
        }
      }
      game_results: {
        Row: {
          id: string
          session_id: string
          game_id: string
          played_at: string
          is_coop: boolean
          coop_won: boolean | null
        }
        Insert: {
          id?: string
          session_id: string
          game_id: string
          played_at?: string
          is_coop?: boolean
          coop_won?: boolean | null
        }
        Update: {
          id?: string
          session_id?: string
          game_id?: string
          played_at?: string
          is_coop?: boolean
          coop_won?: boolean | null
        }
      }
      player_results: {
        Row: {
          id: string
          game_result_id: string
          player_name: string
          rank: number | null
          score: number | null
          is_winner: boolean
        }
        Insert: {
          id?: string
          game_result_id: string
          player_name: string
          rank?: number | null
          score?: number | null
          is_winner?: boolean
        }
        Update: {
          id?: string
          game_result_id?: string
          player_name?: string
          rank?: number | null
          score?: number | null
          is_winner?: boolean
        }
      }
      game_tasks: {
        Row: {
          id: string
          status: 'pending' | 'identifying' | 'scraping' | 'complete' | 'error'
          image_url: string
          identified_name: string | null
          confidence: number | null
          bgg_url: string | null
          game_id: string | null
          error_message: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          status?: 'pending' | 'identifying' | 'scraping' | 'complete' | 'error'
          image_url: string
          identified_name?: string | null
          confidence?: number | null
          bgg_url?: string | null
          game_id?: string | null
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          status?: 'pending' | 'identifying' | 'scraping' | 'complete' | 'error'
          image_url?: string
          identified_name?: string | null
          confidence?: number | null
          bgg_url?: string | null
          game_id?: string | null
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
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
export type Vote = Database['public']['Tables']['votes']['Row']
export type Session = Database['public']['Tables']['sessions']['Row']
export type SessionGame = Database['public']['Tables']['session_games']['Row']
export type SessionVote = Database['public']['Tables']['session_votes']['Row']
export type GameResult = Database['public']['Tables']['game_results']['Row']
export type PlayerResult = Database['public']['Tables']['player_results']['Row']
export type GameTask = Database['public']['Tables']['game_tasks']['Row']
