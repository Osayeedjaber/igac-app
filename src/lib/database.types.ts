export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      site_settings: {
        Row: {
          id: string;
          site_name: string;
          site_tagline: string;
          site_description: string;
          contact_email: string;
          contact_phone: string;
          contact_address: string;
          social_facebook: string;
          social_instagram: string;
          social_linkedin: string;
          social_twitter: string;
          social_youtube: string;
          logo_url: string;
          primary_color: string;
          stat_total_events: string;
          stat_total_delegates: string;
          stat_years_active: string;
          maintenance_mode: boolean;
          registration_open: boolean;
          recruitment_open: boolean;
          join_form_url: string;
          register_url: string;
          announcement: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          site_name?: string;
          site_tagline?: string;
          site_description?: string;
          contact_email?: string;
          contact_phone?: string;
          contact_address?: string;
          social_facebook?: string;
          social_instagram?: string;
          social_linkedin?: string;
          social_twitter?: string;
          social_youtube?: string;
          logo_url?: string;
          primary_color?: string;
          stat_total_events?: string;
          stat_total_delegates?: string;
          stat_years_active?: string;
          maintenance_mode?: boolean;
          registration_open?: boolean;
          recruitment_open?: boolean;
          join_form_url?: string;
          register_url?: string;
          announcement?: string;
        };
        Update: {
          site_name?: string;
          site_tagline?: string;
          site_description?: string;
          contact_email?: string;
          contact_phone?: string;
          contact_address?: string;
          social_facebook?: string;
          social_instagram?: string;
          social_linkedin?: string;
          social_twitter?: string;
          social_youtube?: string;
          logo_url?: string;
          primary_color?: string;
          stat_total_events?: string;
          stat_total_delegates?: string;
          stat_years_active?: string;
          maintenance_mode?: boolean;
          registration_open?: boolean;
          recruitment_open?: boolean;
          join_form_url?: string;
          register_url?: string;
          announcement?: string;
        };
        Relationships: [];
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject?: string;
          message: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          email?: string;
          subject?: string;
          message?: string;
          status?: string;
        };
        Relationships: [];
      };
      activity_log: {
        Row: {
          id: string;
          action: string;
          entity_type: string;
          entity_id: string;
          entity_name: string;
          details: Json;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          action: string;
          entity_type: string;
          entity_id?: string;
          entity_name?: string;
          details?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          action?: string;
          entity_type?: string;
          entity_id?: string;
          entity_name?: string;
          details?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          id: string;
          name: string;
          role: string;
          image: string;
          department: string;
          quote: string;
          description: string;
          category:
            | "governing_body"
            | "core_panel"
            | "head"
            | "deputy"
            | "ctg_core"
            | "executive"
            | "ctg_head"
            | "ctg_deputy"
            | "ctg_executive";
          sort_order: number;
          socials: Json;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: string;
          image?: string;
          department?: string;
          quote?: string;
          description?: string;
          category:
            | "governing_body"
            | "core_panel"
            | "head"
            | "deputy"
            | "ctg_core"
            | "executive"
            | "ctg_head"
            | "ctg_deputy"
            | "ctg_executive";
          sort_order?: number;
          socials?: Json;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: string;
          image?: string;
          department?: string;
          quote?: string;
          description?: string;
          category?:
            | "governing_body"
            | "core_panel"
            | "head"
            | "deputy"
            | "ctg_core"
            | "executive"
            | "ctg_head"
            | "ctg_deputy"
            | "ctg_executive";
          sort_order?: number;
          socials?: Json;
          is_visible?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      gallery_images: {
        Row: {
          id: string;
          url: string;
          filename: string;
          folder: string;
          alt_text: string;
          file_size: number;
          mime_type: string;
          width: number | null;
          height: number | null;
          used_in: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          url: string;
          filename?: string;
          folder?: string;
          alt_text?: string;
          file_size?: number;
          mime_type?: string;
          width?: number | null;
          height?: number | null;
          used_in?: Json;
          created_at?: string;
        };
        Update: {
          url?: string;
          filename?: string;
          folder?: string;
          alt_text?: string;
          file_size?: number;
          mime_type?: string;
          width?: number | null;
          height?: number | null;
          used_in?: Json;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          subtitle: string;
          date: string;
          year: number;
          month: string;
          location: string;
          image: string;
          description: string;
          division: string;
          tag: string;
          stats: Json;
          highlights: Json;
          sort_order: number;
          featured: boolean;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          subtitle?: string;
          date: string;
          year: number;
          month: string;
          location: string;
          image?: string;
          description?: string;
          division?: string;
          tag?: string;
          stats?: Json;
          highlights?: Json;
          sort_order?: number;
          featured?: boolean;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          subtitle?: string;
          date?: string;
          year?: number;
          month?: string;
          location?: string;
          image?: string;
          description?: string;
          division?: string;
          tag?: string;
          stats?: Json;
          highlights?: Json;
          sort_order?: number;
          featured?: boolean;
          is_visible?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
