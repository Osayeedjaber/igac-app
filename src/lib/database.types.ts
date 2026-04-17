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
      delegates: {
        Row: {
          id: string
          full_name: string
          email: string
          committee: string | null
          country: string | null
          qr_token: string
          mail_status: 'PENDING' | 'PROCESSING' | 'SENT' | 'FAILED'
          allocation_mail_sent_at: string | null
          last_mail_error: string | null
          created_at: string
          qr_token_image?: string | null
          transaction_id?: string | null
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          committee?: string | null
          country?: string | null
          qr_token: string
          mail_status?: 'PENDING' | 'PROCESSING' | 'SENT' | 'FAILED'
          allocation_mail_sent_at?: string | null
          last_mail_error?: string | null
          created_at?: string
          qr_token_image?: string | null
          transaction_id?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          committee?: string | null
          country?: string | null
          qr_token?: string
          mail_status?: 'PENDING' | 'PROCESSING' | 'SENT' | 'FAILED'
          allocation_mail_sent_at?: string | null
          last_mail_error?: string | null
          created_at?: string
          qr_token_image?: string | null
          transaction_id?: string | null
        }
      }
      delegate_checkins: {
        Row: {
          id: string
          delegate_id: string
          day: number
          checkpoint: string
          scanned_by_id: string | null
          scan_type: 'ENTRY' | 'EXIT'
          scanned_at: string
          created_at: string
        }
        Insert: {
          id?: string
          delegate_id: string
          day: number
          checkpoint: string
          scanned_by_id?: string | null
          scan_type?: 'ENTRY' | 'EXIT'
          scanned_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          delegate_id?: string
          day?: number
          checkpoint?: string
          scanned_by_id?: string | null
          scan_type?: 'ENTRY' | 'EXIT'
          scanned_at?: string
          created_at?: string
        }
      }
      secretariat_profiles: {
        Row: {
          id: string
          full_name: string
          role: string
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: string
          created_at?: string
        }
      }
      system_settings: {
        Row: {
          id: number
          active_day: number
          active_checkpoint: string
          active_scan_mode?: string
        }
        Insert: {
          id?: number
          active_day?: number
          active_checkpoint?: string
          active_scan_mode?: string
        }
        Update: {
          id?: number
          active_day?: number
          active_checkpoint?: string
          active_scan_mode?: string
        }
      }
    }
  }
}
