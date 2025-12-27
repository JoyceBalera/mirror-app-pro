export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_analyses: {
        Row: {
          analysis_text: string
          generated_at: string
          id: string
          model_used: string | null
          session_id: string
        }
        Insert: {
          analysis_text: string
          generated_at?: string
          id?: string
          model_used?: string | null
          session_id: string
        }
        Update: {
          analysis_text?: string
          generated_at?: string
          id?: string
          model_used?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_analyses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "test_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      human_design_analyses: {
        Row: {
          analysis_text: string
          created_at: string
          generated_at: string
          id: string
          model_used: string | null
          result_id: string
        }
        Insert: {
          analysis_text: string
          created_at?: string
          generated_at?: string
          id?: string
          model_used?: string | null
          result_id: string
        }
        Update: {
          analysis_text?: string
          created_at?: string
          generated_at?: string
          id?: string
          model_used?: string | null
          result_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "human_design_analyses_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "human_design_results"
            referencedColumns: ["id"]
          },
        ]
      }
      human_design_results: {
        Row: {
          activated_gates: number[]
          authority: string | null
          birth_date: string
          birth_lat: number | null
          birth_location: string
          birth_lon: number | null
          birth_time: string
          centers: Json
          channels: Json
          created_at: string
          definition: string | null
          design_activations: Json
          design_date: string | null
          energy_type: string
          id: string
          incarnation_cross: string | null
          personality_activations: Json
          profile: string | null
          session_id: string | null
          strategy: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_gates?: number[]
          authority?: string | null
          birth_date: string
          birth_lat?: number | null
          birth_location: string
          birth_lon?: number | null
          birth_time: string
          centers?: Json
          channels?: Json
          created_at?: string
          definition?: string | null
          design_activations?: Json
          design_date?: string | null
          energy_type: string
          id?: string
          incarnation_cross?: string | null
          personality_activations?: Json
          profile?: string | null
          session_id?: string | null
          strategy?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_gates?: number[]
          authority?: string | null
          birth_date?: string
          birth_lat?: number | null
          birth_location?: string
          birth_lon?: number | null
          birth_time?: string
          centers?: Json
          channels?: Json
          created_at?: string
          definition?: string | null
          design_activations?: Json
          design_date?: string | null
          energy_type?: string
          id?: string
          incarnation_cross?: string | null
          personality_activations?: Json
          profile?: string | null
          session_id?: string | null
          strategy?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "human_design_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "human_design_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      human_design_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      test_answers: {
        Row: {
          answered_at: string
          id: string
          question_id: string
          score: number
          session_id: string
        }
        Insert: {
          answered_at?: string
          id?: string
          question_id: string
          score: number
          session_id: string
        }
        Update: {
          answered_at?: string
          id?: string
          question_id?: string
          score?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "test_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      test_results: {
        Row: {
          calculated_at: string
          classifications: Json
          facet_scores: Json
          id: string
          session_id: string
          trait_scores: Json
        }
        Insert: {
          calculated_at?: string
          classifications: Json
          facet_scores: Json
          id?: string
          session_id: string
          trait_scores: Json
        }
        Update: {
          calculated_at?: string
          classifications?: Json
          facet_scores?: Json
          id?: string
          session_id?: string
          trait_scores?: Json
        }
        Relationships: [
          {
            foreignKeyName: "test_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "test_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      test_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_test_access: {
        Row: {
          big_five_completed_at: string | null
          created_at: string
          desenho_humano_completed_at: string | null
          has_big_five: boolean
          has_desenho_humano: boolean
          id: string
          integrated_report_available: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          big_five_completed_at?: string | null
          created_at?: string
          desenho_humano_completed_at?: string | null
          has_big_five?: boolean
          has_desenho_humano?: boolean
          id?: string
          integrated_report_available?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          big_five_completed_at?: string | null
          created_at?: string
          desenho_humano_completed_at?: string | null
          has_big_five?: boolean
          has_desenho_humano?: boolean
          id?: string
          integrated_report_available?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
