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
            conversations: {
                Row: {
                    id: string
                    last_message_at: string | null
                    last_message_text: string | null
                    participant_1: string | null
                    participant_2: string | null
                }
                Insert: {
                    id?: string
                    last_message_at?: string | null
                    last_message_text?: string | null
                    participant_1?: string | null
                    participant_2?: string | null
                }
                Update: {
                    id?: string
                    last_message_at?: string | null
                    last_message_text?: string | null
                    participant_1?: string | null
                    participant_2?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "conversations_participant_1_fkey"
                        columns: ["participant_1"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "conversations_participant_2_fkey"
                        columns: ["participant_2"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            favorite_contributors: {
                Row: {
                    contributor_id: string
                    follower_id: string
                }
                Insert: {
                    contributor_id: string
                    follower_id: string
                }
                Update: {
                    contributor_id?: string
                    follower_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "favorite_contributors_contributor_id_fkey"
                        columns: ["contributor_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "favorite_contributors_follower_id_fkey"
                        columns: ["follower_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            favorite_restaurants: {
                Row: {
                    restaurant_id: string
                    user_id: string
                }
                Insert: {
                    restaurant_id: string
                    user_id: string
                }
                Update: {
                    restaurant_id?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "favorite_restaurants_restaurant_id_fkey"
                        columns: ["restaurant_id"]
                        isOneToOne: false
                        referencedRelation: "restaurants"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "favorite_restaurants_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            messages: {
                Row: {
                    conversation_id: string | null
                    created_at: string | null
                    id: string
                    is_read: boolean | null
                    sender_id: string | null
                    text: string
                }
                Insert: {
                    conversation_id?: string | null
                    created_at?: string | null
                    id?: string
                    is_read?: boolean | null
                    sender_id?: string | null
                    text: string
                }
                Update: {
                    conversation_id?: string | null
                    created_at?: string | null
                    id?: string
                    is_read?: boolean | null
                    sender_id?: string | null
                    text?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "messages_conversation_id_fkey"
                        columns: ["conversation_id"]
                        isOneToOne: false
                        referencedRelation: "conversations"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "messages_sender_id_fkey"
                        columns: ["sender_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    bio: string | null
                    city: string | null
                    created_at: string | null
                    full_name: string | null
                    id: string
                    is_contributor: boolean | null
                    subscription_end_date: string | null
                    username: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    bio?: string | null
                    city?: string | null
                    created_at?: string | null
                    full_name?: string | null
                    id: string
                    is_contributor?: boolean | null
                    subscription_end_date?: string | null
                    username?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    bio?: string | null
                    city?: string | null
                    created_at?: string | null
                    full_name?: string | null
                    id?: string
                    is_contributor?: boolean | null
                    subscription_end_date?: string | null
                    username?: string | null
                }
                Relationships: []
            }
            restaurants: {
                Row: {
                    address: string | null
                    atmospheres: string[] | null
                    budget_level: number | null
                    city: string | null
                    country: string | null
                    created_at: string | null
                    department: string | null
                    dietary_prefs: string[] | null
                    food_types: string[] | null
                    id: string
                    image_url: string | null
                    lat: number | null
                    lng: number | null
                    meal_types: string[] | null
                    name: string
                    postal_code: string | null
                    region: string | null
                    services: string[] | null
                }
                Insert: {
                    address?: string | null
                    atmospheres?: string[] | null
                    budget_level?: number | null
                    city?: string | null
                    country?: string | null
                    created_at?: string | null
                    department?: string | null
                    dietary_prefs?: string[] | null
                    food_types?: string[] | null
                    id?: string
                    image_url?: string | null
                    lat?: number | null
                    lng?: number | null
                    meal_types?: string[] | null
                    name: string
                    postal_code?: string | null
                    region?: string | null
                    services?: string[] | null
                }
                Update: {
                    address?: string | null
                    atmospheres?: string[] | null
                    budget_level?: number | null
                    city?: string | null
                    country?: string | null
                    created_at?: string | null
                    department?: string | null
                    dietary_prefs?: string[] | null
                    food_types?: string[] | null
                    id?: string
                    image_url?: string | null
                    lat?: number | null
                    lng?: number | null
                    meal_types?: string[] | null
                    name?: string
                    postal_code?: string | null
                    region?: string | null
                    services?: string[] | null
                }
                Relationships: []
            }
            reviews: {
                Row: {
                    contributor_id: string | null
                    created_at: string | null
                    description: string | null
                    id: string
                    rating: number | null
                    restaurant_id: string | null
                    title: string | null
                }
                Insert: {
                    contributor_id?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    rating?: number | null
                    restaurant_id?: string | null
                    title?: string | null
                }
                Update: {
                    contributor_id?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    rating?: number | null
                    restaurant_id?: string | null
                    title?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "reviews_contributor_id_fkey"
                        columns: ["contributor_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "reviews_restaurant_id_fkey"
                        columns: ["restaurant_id"]
                        isOneToOne: false
                        referencedRelation: "restaurants"
                        referencedColumns: ["id"]
                    },
                ]
            }
            souvenirs: {
                Row: {
                    date: string | null
                    description: string | null
                    id: string
                    photos_urls: string[] | null
                    rating: number | null
                    restaurant_id: string | null
                    title: string | null
                    traveler_id: string | null
                }
                Insert: {
                    date?: string | null
                    description?: string | null
                    id?: string
                    photos_urls?: string[] | null
                    rating?: number | null
                    restaurant_id?: string | null
                    title?: string | null
                    traveler_id?: string | null
                }
                Update: {
                    date?: string | null
                    description?: string | null
                    id?: string
                    photos_urls?: string[] | null
                    rating?: number | null
                    restaurant_id?: string | null
                    title?: string | null
                    traveler_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "souvenirs_restaurant_id_fkey"
                        columns: ["restaurant_id"]
                        isOneToOne: false
                        referencedRelation: "restaurants"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "souvenirs_traveler_id_fkey"
                        columns: ["traveler_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            trips: {
                Row: {
                    created_at: string
                    description: string | null
                    id: string
                    name: string
                    status: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    name: string
                    status?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    name?: string
                    status?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            trip_steps: {
                Row: {
                    created_at: string
                    id: string
                    meal_type: string | null
                    restaurant_id: string
                    step_order: number
                    trip_id: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    meal_type?: string | null
                    restaurant_id: string
                    step_order: number
                    trip_id: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    meal_type?: string | null
                    restaurant_id?: string
                    step_order?: number
                    trip_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "trip_steps_restaurant_id_fkey"
                        columns: ["restaurant_id"]
                        isOneToOne: false
                        referencedRelation: "restaurants"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "trip_steps_trip_id_fkey"
                        columns: ["trip_id"]
                        isOneToOne: false
                        referencedRelation: "trips"
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

// Convenience aliases
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Restaurant = Database['public']['Tables']['restaurants']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Trip = Database['public']['Tables']['trips']['Row']
export type TripStep = Database['public']['Tables']['trip_steps']['Row']
export type Souvenir = Database['public']['Tables']['souvenirs']['Row']
