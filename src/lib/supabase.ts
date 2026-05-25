import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables not configured. Please check your environment setup.')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// Types
export interface Profile {
  id: string
  email: string
  full_name?: string
  phone?: string
  preferred_language?: 'de' | 'fr' | 'en'
  neph_number?: string
  avatar_url?: string
  cover_url?: string
  address?: string
  city?: string
  postal_code?: string
  region?: string
  bio?: string
  social_links?: { [key: string]: string }
  is_public?: boolean
  role?: string
  created_at: string
  updated_at: string
  last_seen?: string;
}

export interface LicenseType {
  id: string
  category: string
  name_de: string
  name_en: string
  name_fr?: string
  description_de?: string
  description_en?: string
  description_fr?: string
  price_net_euros: number
  price_gross_euros: number
  vat_rate: number
  theory_test_fee?: number
  practical_test_fee?: number
  image_url?: string
  processing_days: number
  requires_theory_test: boolean
  requires_practical_test?: boolean
  minimum_age: number
  is_active: boolean
}

export interface LicenseApplication {
  id: string
  user_id: string
  license_type_id: string
  status: 'draft' | 'pending_payment' | 'submitted' | 'in_review' | 'approved' | 'completed' | 'rejected'
  application_number?: string
  address?: string
  city?: string
  postal_code?: string
  region?: string
  total_amount: number
  theory_test_needed: boolean
  theory_test_fee: number
  form_data: Record<string, any>
  notes?: string
  submitted_at?: string
  approved_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
  license_type?: LicenseType
}

export interface DocumentType {
  id: string
  name_fr: string
  name_en: string
  description_fr?: string
  description_en?: string
  is_required: boolean
  accepted_formats: string[]
  max_size_mb: number
}

export interface ApplicationDocument {
  id: string
  application_id: string
  document_type_id: string
  file_name: string
  file_path: string
  file_size?: number
  mime_type?: string
  uploaded_at: string
  verified_at?: string
  verified_by?: string
  notes?: string
  document_type?: DocumentType
}

export interface Payment {
  id: string
  application_id: string
  amount_euros: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_method?: string
  transaction_id?: string
  paid_at?: string
  created_at: string
}

export interface ContactMessage {
  id?: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  language?: 'fr' | 'en'
  replied?: boolean
  created_at?: string
}

export type ReactionType = 'like' | 'love' | 'wow' | 'sad' | 'angry';

export interface Testimonial {
  id: string;
  created_at: string;
  author_name: string;
  author_email?: string;
  rating: number;
  content: string;
  media_urls?: string[];
  city?: string;
  region?: string;
  is_pinned: boolean;
  status: 'pending' | 'approved' | 'rejected';
  reactions: Record<ReactionType, number>;
  user_id?: string;
  license_type_ids?: string[];
  share_counts?: { [key: string]: number };
  profiles?: {
    avatar_url?: string;
    full_name?: string;
  } | null;
  comments?: {
    count: number;
  }[];
}

export interface TestimonialReaction {
  id: string;
  testimonial_id: string;
  user_id: string;
  reaction_type: ReactionType;
}

export interface TestimonialComment {
  id: string;
  testimonial_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface GalleryMedia {
  id: string;
  user_id?: string | null;
  media_type: 'image' | 'video';
  media_url: string;
  thumbnail_url?: string;
  title?: string;
  description?: string;
  video_platform?: string;
  likes_count?: number;
  views_count?: number;
  is_approved: boolean;
  is_public: boolean;
  created_at: string;
  profiles?: Profile | null;
  likes?: { count: number }[];
  comments?: { count: number }[];
  favorites?: { count: number }[];
  share_counts?: { [key: string]: number };
}

export interface GalleryLike {
  id: string;
  media_id: string;
  user_id: string;
}

export interface GalleryFavorite {
  id: string;
  media_id: string;
  user_id: string;
}

export interface GalleryComment {
  id: string;
  media_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: Profile;
  gallery_comment_likes: { count: number }[];
}

export interface GalleryCommentLike {
    id: string;
    comment_id: string;
    user_id: string;
}

export interface Conversation {
  id: string;
  created_at: string;
  other_participant: Partial<Profile>;
  last_message_text: string | null;
  last_message_time: string | null;
  unread_count: number;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  content: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'file' | 'gif' | 'profile' | 'voice';
  location_data?: { latitude: number; longitude: number };
  created_at: string;
  read_at?: string;
  reply_to?: number | null;
  is_deleted?: boolean;
}

export type PresenceState = {
  [key: string]: {
    online_at: string,
    presence_ref: string,
  }[],
};

export type TypingEvent = {
  event: 'TYPING_START' | 'TYPING_STOP',
  payload: {
    user_id: string,
    user_name: string,
  }
};
