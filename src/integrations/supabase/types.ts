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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      audit_requests: {
        Row: {
          besoin: string | null
          created_at: string
          email: string
          id: string
          nom: string
          prenom: string
          secteur: string
          status: string
          telephone: string | null
        }
        Insert: {
          besoin?: string | null
          created_at?: string
          email: string
          id?: string
          nom: string
          prenom: string
          secteur: string
          status?: string
          telephone?: string | null
        }
        Update: {
          besoin?: string | null
          created_at?: string
          email?: string
          id?: string
          nom?: string
          prenom?: string
          secteur?: string
          status?: string
          telephone?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          besoin: string | null
          created_at: string
          date: string
          email: string
          id: string
          nom: string
          prenom: string
          secteur: string
          status: string
          telephone: string | null
          time: string
        }
        Insert: {
          besoin?: string | null
          created_at?: string
          date: string
          email: string
          id?: string
          nom: string
          prenom: string
          secteur: string
          status?: string
          telephone?: string | null
          time: string
        }
        Update: {
          besoin?: string | null
          created_at?: string
          date?: string
          email?: string
          id?: string
          nom?: string
          prenom?: string
          secteur?: string
          status?: string
          telephone?: string | null
          time?: string
        }
        Relationships: []
      }
      client_projects: {
        Row: {
          created_at: string
          delivered_at: string | null
          id: string
          lead_id: string
          name: string
          notes: string | null
          progress: number
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          id?: string
          lead_id: string
          name: string
          notes?: string | null
          progress?: number
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          id?: string
          lead_id?: string
          name?: string
          notes?: string | null
          progress?: number
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_projects_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "audit_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      client_subscriptions: {
        Row: {
          created_at: string
          hosting_domain: string | null
          hosting_included: boolean
          id: string
          last_payment_at: string | null
          lead_id: string
          monthly_amount: number
          next_payment_at: string | null
          notes: string | null
          offer_level: string
          options: string[]
          payment_status: string
          payment_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hosting_domain?: string | null
          hosting_included?: boolean
          id?: string
          last_payment_at?: string | null
          lead_id: string
          monthly_amount?: number
          next_payment_at?: string | null
          notes?: string | null
          offer_level?: string
          options?: string[]
          payment_status?: string
          payment_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hosting_domain?: string | null
          hosting_included?: boolean
          id?: string
          last_payment_at?: string | null
          lead_id?: string
          monthly_amount?: number
          next_payment_at?: string | null
          notes?: string | null
          offer_level?: string
          options?: string[]
          payment_status?: string
          payment_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_subscriptions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "audit_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostics: {
        Row: {
          a_un_site: string
          created_at: string
          demandes_semaine: string
          id: string
          offre_recommandee: string
          reseaux_sociaux: string
          secteur: string
          taches_repetitives: string[] | null
        }
        Insert: {
          a_un_site: string
          created_at?: string
          demandes_semaine: string
          id?: string
          offre_recommandee: string
          reseaux_sociaux: string
          secteur: string
          taches_repetitives?: string[] | null
        }
        Update: {
          a_un_site?: string
          created_at?: string
          demandes_semaine?: string
          id?: string
          offre_recommandee?: string
          reseaux_sociaux?: string
          secteur?: string
          taches_repetitives?: string[] | null
        }
        Relationships: []
      }
      follow_ups: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          message: string | null
          scheduled_at: string
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          message?: string | null
          scheduled_at: string
          status?: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          message?: string | null
          scheduled_at?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "audit_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_counters: {
        Row: {
          counter: number
          id: string
        }
        Insert: {
          counter?: number
          id: string
        }
        Update: {
          counter?: number
          id?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          sort_order: number
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          sort_order?: number
          total?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          sort_order?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_address: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          due_date: string | null
          id: string
          issue_date: string
          lead_id: string | null
          notes: string | null
          number: string
          payment_terms: string | null
          status: string
          total_ht: number
          total_ttc: number
          type: string
          updated_at: string
          validity_date: string | null
        }
        Insert: {
          client_address?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          issue_date?: string
          lead_id?: string | null
          notes?: string | null
          number: string
          payment_terms?: string | null
          status?: string
          total_ht?: number
          total_ttc?: number
          type?: string
          updated_at?: string
          validity_date?: string | null
        }
        Update: {
          client_address?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          issue_date?: string
          lead_id?: string | null
          notes?: string | null
          number?: string
          payment_terms?: string | null
          status?: string
          total_ht?: number
          total_ttc?: number
          type?: string
          updated_at?: string
          validity_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "audit_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          lead_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          lead_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "audit_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string
          id: string
          lead_id: string
          notes: string | null
          payment_date: string
          payment_method: string
          subscription_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          lead_id: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          subscription_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          lead_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "audit_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "client_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      product_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          nom: string
          prenom: string
          product: string
          secteur: string
          telephone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          nom: string
          prenom: string
          product: string
          secteur: string
          telephone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nom?: string
          prenom?: string
          product?: string
          secteur?: string
          telephone?: string | null
        }
        Relationships: []
      }
      project_tasks: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          project_id: string
          sort_order: number
          title: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          project_id: string
          sort_order?: number
          title: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          project_id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_payment_statuses: { Args: never; Returns: undefined }
      next_invoice_number: { Args: { p_type: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
