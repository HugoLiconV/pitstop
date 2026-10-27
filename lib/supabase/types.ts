
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "attachments": {
                  Row: {
                    "created_at": string,"file_name": string,"id": string,"mime_type": string | null,"service_id": string,"size_bytes": number,"storage_path": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"file_name": string,"id"?: string,"mime_type"?: string | null,"service_id": string,"size_bytes": number,"storage_path": string,"user_id"?: string
                  }
                  Update: {
                    "created_at"?: string,"file_name"?: string,"id"?: string,"mime_type"?: string | null,"service_id"?: string,"size_bytes"?: number,"storage_path"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "attachments_service_id_fkey"
      columns: ["service_id"]
isOneToOne: false
      referencedRelation: "services"
      referencedColumns: ["id"]
    }
                  ]
                },"maintenance_items": {
                  Row: {
                    "active": boolean,"created_at": string,"id": string,"interval_km": number | null,"interval_months": number | null,"manual_page": string | null,"name": string,"notes": string | null,"source": string,"user_id": string,"vehicle_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"created_at"?: string,"id"?: string,"interval_km"?: number | null,"interval_months"?: number | null,"manual_page"?: string | null,"name": string,"notes"?: string | null,"source"?: string,"user_id"?: string,"vehicle_id": string
                  }
                  Update: {
                    "active"?: boolean,"created_at"?: string,"id"?: string,"interval_km"?: number | null,"interval_months"?: number | null,"manual_page"?: string | null,"name"?: string,"notes"?: string | null,"source"?: string,"user_id"?: string,"vehicle_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "maintenance_items_vehicle_id_fkey"
      columns: ["vehicle_id"]
isOneToOne: false
      referencedRelation: "vehicles"
      referencedColumns: ["id"]
    }
                  ]
                },"odometer_readings": {
                  Row: {
                    "created_at": string,"date": string,"id": string,"km": number,"source": string,"user_id": string,"vehicle_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"date": string,"id"?: string,"km": number,"source": string,"user_id"?: string,"vehicle_id": string
                  }
                  Update: {
                    "created_at"?: string,"date"?: string,"id"?: string,"km"?: number,"source"?: string,"user_id"?: string,"vehicle_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "odometer_readings_vehicle_id_fkey"
      columns: ["vehicle_id"]
isOneToOne: false
      referencedRelation: "vehicles"
      referencedColumns: ["id"]
    }
                  ]
                },"service_items": {
                  Row: {
                    "cost_mxn": number | null,"created_at": string,"id": string,"maintenance_item_id": string,"service_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "cost_mxn"?: number | null,"created_at"?: string,"id"?: string,"maintenance_item_id": string,"service_id": string,"user_id"?: string
                  }
                  Update: {
                    "cost_mxn"?: number | null,"created_at"?: string,"id"?: string,"maintenance_item_id"?: string,"service_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "service_items_maintenance_item_id_fkey"
      columns: ["maintenance_item_id"]
isOneToOne: false
      referencedRelation: "maintenance_items"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "service_items_service_id_fkey"
      columns: ["service_id"]
isOneToOne: false
      referencedRelation: "services"
      referencedColumns: ["id"]
    }
                  ]
                },"services": {
                  Row: {
                    "client_token": string | null,"created_at": string,"date": string,"id": string,"km": number,"notes": string | null,"total_cost_mxn": number | null,"user_id": string,"vehicle_id": string,"workshop": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "client_token"?: string | null,"created_at"?: string,"date": string,"id"?: string,"km": number,"notes"?: string | null,"total_cost_mxn"?: number | null,"user_id"?: string,"vehicle_id": string,"workshop"?: string | null
                  }
                  Update: {
                    "client_token"?: string | null,"created_at"?: string,"date"?: string,"id"?: string,"km"?: number,"notes"?: string | null,"total_cost_mxn"?: number | null,"user_id"?: string,"vehicle_id"?: string,"workshop"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "services_vehicle_id_fkey"
      columns: ["vehicle_id"]
isOneToOne: false
      referencedRelation: "vehicles"
      referencedColumns: ["id"]
    }
                  ]
                },"vehicles": {
                  Row: {
                    "created_at": string,"id": string,"initial_km": number,"name": string,"plate": string | null,"purchase_date": string,"user_id": string,"vin": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"initial_km": number,"name": string,"plate"?: string | null,"purchase_date": string,"user_id"?: string,"vin"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"initial_km"?: number,"name"?: string,"plate"?: string | null,"purchase_date"?: string,"user_id"?: string,"vin"?: string | null
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "record_service":
{ Args: { "p_client_token": string,"p_date": string,"p_items": Json,"p_km": number,"p_notes": string,"p_total_cost": number,"p_vehicle_id": string,"p_workshop": string }; Returns: string
                           },
"seed_pitstop":
{ Args: { "p_initial_km": number,"p_purchase_date": string,"p_user": string }; Returns: string
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
