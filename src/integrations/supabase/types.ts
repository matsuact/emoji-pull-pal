export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cost_calculations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          other_costs: Json
          other_subtotal: number
          personnel_subtotal: number
          team_members: Json
          title: string
          total_cost: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          other_costs?: Json
          other_subtotal?: number
          personnel_subtotal?: number
          team_members?: Json
          title: string
          total_cost?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          other_costs?: Json
          other_subtotal?: number
          personnel_subtotal?: number
          team_members?: Json
          title?: string
          total_cost?: number
          updated_at?: string
        }
        Relationships: []
      }
      "estimate-craft-master": {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      financial_plans: {
        Row: {
          created_at: string
          expenses: Json
          id: string
          project_id: string
          revenues: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          expenses?: Json
          id?: string
          project_id: string
          revenues?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          expenses?: Json
          id?: string
          project_id?: string
          revenues?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_plans_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      labor_rates: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          margin: number | null
          monthly_cost: number
          monthly_rate: number
          notes: string | null
          profit_rate: number | null
          rank: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          margin?: number | null
          monthly_cost: number
          monthly_rate: number
          notes?: string | null
          profit_rate?: number | null
          rank: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          margin?: number | null
          monthly_cost?: number
          monthly_rate?: number
          notes?: string | null
          profit_rate?: number | null
          rank?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      project_costs: {
        Row: {
          created_at: string
          equipment_cost: number | null
          id: string
          labor_cost: number | null
          material_cost: number | null
          project_id: string
          subcontractor_cost: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          equipment_cost?: number | null
          id?: string
          labor_cost?: number | null
          material_cost?: number | null
          project_id: string
          subcontractor_cost?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          equipment_cost?: number | null
          id?: string
          labor_cost?: number | null
          material_cost?: number | null
          project_id?: string
          subcontractor_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_costs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_cost: number | null
          budget: number
          client_name: string
          cost_calculation_id: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          budget: number
          client_name: string
          cost_calculation_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date: string
          status: string
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          budget?: number
          client_name?: string
          cost_calculation_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_cost_calculation_id_fkey"
            columns: ["cost_calculation_id"]
            isOneToOne: false
            referencedRelation: "cost_calculations"
            referencedColumns: ["id"]
          },
        ]
      }
      wbs_items: {
        Row: {
          assignee: string | null
          collapsed: boolean | null
          created_at: string
          description: string | null
          duration: number
          id: string
          level: number
          parent_id: string | null
          progress: number | null
          project_id: string
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assignee?: string | null
          collapsed?: boolean | null
          created_at?: string
          description?: string | null
          duration: number
          id?: string
          level: number
          parent_id?: string | null
          progress?: number | null
          project_id: string
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assignee?: string | null
          collapsed?: boolean | null
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          level?: number
          parent_id?: string | null
          progress?: number | null
          project_id?: string
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wbs_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "wbs_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wbs_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
