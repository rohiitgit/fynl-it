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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      email_logs: {
        Row: {
          clicked_at: string | null
          created_at: string
          delivered_at: string | null
          email_type: string
          error_message: string | null
          follow_up_id: string | null
          id: string
          invoice_id: string | null
          message_id: string | null
          opened_at: string | null
          recipient_email: string
          sent_at: string
          status: string
          subject: string
          user_id: string
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string
          delivered_at?: string | null
          email_type: string
          error_message?: string | null
          follow_up_id?: string | null
          id?: string
          invoice_id?: string | null
          message_id?: string | null
          opened_at?: string | null
          recipient_email: string
          sent_at?: string
          status: string
          subject: string
          user_id: string
        }
        Update: {
          clicked_at?: string | null
          created_at?: string
          delivered_at?: string | null
          email_type?: string
          error_message?: string | null
          follow_up_id?: string | null
          id?: string
          invoice_id?: string | null
          message_id?: string | null
          opened_at?: string | null
          recipient_email?: string
          sent_at?: string
          status?: string
          subject?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_follow_up_id_fkey"
            columns: ["follow_up_id"]
            isOneToOne: false
            referencedRelation: "follow_ups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_ups: {
        Row: {
          clicked_at: string | null
          content: string
          created_at: string
          delivery_status: string | null
          email_type: string
          id: string
          invoice_id: string
          message_id: string | null
          opened_at: string | null
          scheduled_for: string
          sent_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clicked_at?: string | null
          content: string
          created_at?: string
          delivery_status?: string | null
          email_type: string
          id?: string
          invoice_id: string
          message_id?: string | null
          opened_at?: string | null
          scheduled_for: string
          sent_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clicked_at?: string | null
          content?: string
          created_at?: string
          delivery_status?: string | null
          email_type?: string
          id?: string
          invoice_id?: string
          message_id?: string | null
          opened_at?: string | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          auto_detected: boolean | null
          client_email: string
          client_name: string
          created_at: string
          currency: string
          description: string | null
          due_date: string
          id: string
          invoice_number: string
          is_legacy: boolean | null
          paid_at: string | null
          payment_instructions: string | null
          payment_link: string | null
          payment_method_source: string | null
          payment_provider: string | null
          payment_reference: string | null
          qr_code_url: string | null
          razorpay_link_id: string | null
          razorpay_payment_id: string | null
          status: string
          updated_at: string
          upi_link: string | null
          user_id: string
          user_payment_details: string | null
        }
        Insert: {
          amount: number
          auto_detected?: boolean | null
          client_email: string
          client_name: string
          created_at?: string
          currency?: string
          description?: string | null
          due_date: string
          id?: string
          invoice_number: string
          is_legacy?: boolean | null
          paid_at?: string | null
          payment_instructions?: string | null
          payment_link?: string | null
          payment_method_source?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          qr_code_url?: string | null
          razorpay_link_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          updated_at?: string
          upi_link?: string | null
          user_id: string
          user_payment_details?: string | null
        }
        Update: {
          amount?: number
          auto_detected?: boolean | null
          client_email?: string
          client_name?: string
          created_at?: string
          currency?: string
          description?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          is_legacy?: boolean | null
          paid_at?: string | null
          payment_instructions?: string | null
          payment_link?: string | null
          payment_method_source?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          qr_code_url?: string | null
          razorpay_link_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          updated_at?: string
          upi_link?: string | null
          user_id?: string
          user_payment_details?: string | null
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          event_type: string
          external_payment_id: string
          id: string
          invoice_id: string | null
          payment_method: string | null
          payment_provider: string
          processed_at: string
          status: string
          webhook_data: Json | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          event_type: string
          external_payment_id: string
          id?: string
          invoice_id?: string | null
          payment_method?: string | null
          payment_provider: string
          processed_at?: string
          status: string
          webhook_data?: Json | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          event_type?: string
          external_payment_id?: string
          id?: string
          invoice_id?: string | null
          payment_method?: string | null
          payment_provider?: string
          processed_at?: string
          status?: string
          webhook_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_name: string | null
          created_at: string
          custom_domain: string | null
          domain_verified: boolean | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          preferred_from_email: string | null
          preferred_from_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          custom_domain?: string | null
          domain_verified?: boolean | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          preferred_from_email?: string | null
          preferred_from_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_name?: string | null
          created_at?: string
          custom_domain?: string | null
          domain_verified?: boolean | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          preferred_from_email?: string | null
          preferred_from_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      email_activity: {
        Row: {
          clicked_at: string | null
          client_name: string | null
          delivered_at: string | null
          email_type: string | null
          invoice_id: string | null
          invoice_number: string | null
          opened_at: string | null
          sent_at: string | null
          status: string | null
          user_id: string | null
          was_clicked: boolean | null
          was_opened: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_analytics: {
        Row: {
          avg_days_to_payment: number | null
          direct_payment_amount: number | null
          direct_payment_invoices: number | null
          overdue_invoices: number | null
          paid_amount: number | null
          paid_invoices: number | null
          pending_amount: number | null
          pending_invoices: number | null
          platform_payment_amount: number | null
          platform_payment_invoices: number | null
          total_amount: number | null
          total_invoices: number | null
          user_id: string | null
        }
        Relationships: []
      }
      upi_payment_analytics: {
        Row: {
          avg_hours_to_payment: number | null
          paid_upi_amount: number | null
          paid_upi_invoices: number | null
          total_upi_amount: number | null
          total_upi_invoices: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_payment_details_for_invoice: {
        Args: { invoice_row: Database["public"]["Tables"]["invoices"]["Row"] }
        Returns: string
      }
      is_direct_payment: {
        Args: { invoice_row: Database["public"]["Tables"]["invoices"]["Row"] }
        Returns: boolean
      }
      update_overdue_invoices: { Args: never; Returns: undefined }
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