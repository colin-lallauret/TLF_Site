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
            profiles: {
                Row: {
                    id: string
                    username: string | null
                    full_name: string | null
                    bio: string | null
                    city: string | null
                    avatar_url: string | null
                    is_contributor: boolean | null
                    subscription_end_date: string | null
                    created_at: string | null
                }
                Insert: {
                    id: string
                    username?: string | null
                    full_name?: string | null
                    bio?: string | null
                    city?: string | null
                    avatar_url?: string | null
                    is_contributor?: boolean | null
                    subscription_end_date?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    username?: string | null
                    full_name?: string | null
                    bio?: string | null
                    city?: string | null
                    avatar_url?: string | null
                    is_contributor?: boolean | null
                    subscription_end_date?: string | null
                    created_at?: string | null
                }
            }
            restaurants: {
                Row: {
                    id: string
                    name: string
                    address: string | null
                    postal_code: string | null
                    city: string | null
                    region: string | null
                    department: string | null
                    country: string | null
                    lat: number | null
                    lng: number | null
                    budget_level: number | null
                    meal_types: string[] | null
                    food_types: string[] | null
                    dietary_prefs: string[] | null
                    services: string[] | null
                    atmospheres: string[] | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    address?: string | null
                    postal_code?: string | null
                    city?: string | null
                    region?: string | null
                    department?: string | null
                    country?: string | null
                    lat?: number | null
                    lng?: number | null
                    budget_level?: number | null
                    meal_types?: string[] | null
                    food_types?: string[] | null
                    dietary_prefs?: string[] | null
                    services?: string[] | null
                    atmospheres?: string[] | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    address?: string | null
                    postal_code?: string | null
                    city?: string | null
                    region?: string | null
                    department?: string | null
                    country?: string | null
                    lat?: number | null
                    lng?: number | null
                    budget_level?: number | null
                    meal_types?: string[] | null
                    food_types?: string[] | null
                    dietary_prefs?: string[] | null
                    services?: string[] | null
                    atmospheres?: string[] | null
                    created_at?: string | null
                }
            }
            reviews: {
                Row: {
                    id: string
                    restaurant_id: string | null
                    contributor_id: string | null
                    title: string | null
                    description: string | null
                    rating: number | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    restaurant_id?: string | null
                    contributor_id?: string | null
                    title?: string | null
                    description?: string | null
                    rating?: number | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    restaurant_id?: string | null
                    contributor_id?: string | null
                    title?: string | null
                    description?: string | null
                    rating?: number | null
                    created_at?: string | null
                }
            }
            conversations: {
                Row: {
                    id: string
                    participant_1: string | null
                    participant_2: string | null
                    last_message_text: string | null
                    last_message_at: string | null
                }
                Insert: {
                    id?: string
                    participant_1?: string | null
                    participant_2?: string | null
                    last_message_text?: string | null
                    last_message_at?: string | null
                }
                Update: {
                    id?: string
                    participant_1?: string | null
                    participant_2?: string | null
                    last_message_text?: string | null
                    last_message_at?: string | null
                }
            }
            messages: {
                Row: {
                    id: string
                    conversation_id: string | null
                    sender_id: string | null
                    text: string
                    is_read: boolean | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    conversation_id?: string | null
                    sender_id?: string | null
                    text: string
                    is_read?: boolean | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    conversation_id?: string | null
                    sender_id?: string | null
                    text?: string
                    is_read?: boolean | null
                    created_at?: string | null
                }
            }
            trips: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    description: string | null
                    status: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    description?: string | null
                    status?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    description?: string | null
                    status?: string | null
                    created_at?: string
                }
            }
            trip_steps: {
                Row: {
                    id: string
                    trip_id: string
                    restaurant_id: string
                    step_order: number
                    meal_type: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    trip_id: string
                    restaurant_id: string
                    step_order: number
                    meal_type?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    trip_id?: string
                    restaurant_id?: string
                    step_order?: number
                    meal_type?: string | null
                    created_at?: string
                }
            }
            favorite_restaurants: {
                Row: {
                    user_id: string
                    restaurant_id: string
                }
                Insert: {
                    user_id: string
                    restaurant_id: string
                }
                Update: {
                    user_id?: string
                    restaurant_id?: string
                }
            }
            souvenirs: {
                Row: {
                    id: string
                    traveler_id: string | null
                    restaurant_id: string | null
                    title: string | null
                    description: string | null
                    rating: number | null
                    photos_urls: string[] | null
                    date: string | null
                }
                Insert: {
                    id?: string
                    traveler_id?: string | null
                    restaurant_id?: string | null
                    title?: string | null
                    description?: string | null
                    rating?: number | null
                    photos_urls?: string[] | null
                    date?: string | null
                }
                Update: {
                    id?: string
                    traveler_id?: string | null
                    restaurant_id?: string | null
                    title?: string | null
                    description?: string | null
                    rating?: number | null
                    photos_urls?: string[] | null
                    date?: string | null
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

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Restaurant = Database['public']['Tables']['restaurants']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Trip = Database['public']['Tables']['trips']['Row']
export type TripStep = Database['public']['Tables']['trip_steps']['Row']
export type FavoriteRestaurant = Database['public']['Tables']['favorite_restaurants']['Row']
export type Souvenir = Database['public']['Tables']['souvenirs']['Row']
