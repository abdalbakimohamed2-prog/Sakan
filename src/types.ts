export type UserRole = 'student' | 'owner' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  status: UserStatus;
  created_at?: string;
  properties_count?: number;
  viewing_requests_count?: number;
}

export type VerificationStatus = 'verified' | 'unverified';
export type ListingStatus = 'active' | 'hidden' | 'pending' | 'rejected';
export type GenderType = 'male' | 'female' | 'any';

export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  is_primary: number;
  caption?: string;
  created_at?: string;
}

export interface Property {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  address: string;
  area: string;
  university: string;
  price: number;
  price_period: string;
  rooms: number;
  bathrooms: number;
  gender_type: GenderType;
  amenities: string[];
  latitude?: number;
  longitude?: number;
  verification_status: VerificationStatus;
  listing_status: ListingStatus;
  views_count: number;
  created_at: string;
  updated_at: string;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  primary_image?: string;
  images_count?: number;
  images?: PropertyImage[];
  is_favorited?: boolean;
}

export type ViewingStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

export interface ViewingRequest {
  id: string;
  student_id: string;
  property_id: string;
  preferred_date: string;
  preferred_time: string;
  status: ViewingStatus;
  notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  property_name?: string;
  property_address?: string;
  property_area?: string;
  property_price?: number;
  student_name?: string;
  student_phone?: string;
  student_email?: string;
  owner_name?: string;
  owner_phone?: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'viewing' | 'verification' | 'system' | 'property';
  is_read: number;
  link?: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: 'property' | 'user';
  target_id: string;
  reason: string;
  details?: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  admin_action_notes?: string;
  created_at: string;
  reporter_name?: string;
  reporter_email?: string;
  reporter_phone?: string;
  target_name?: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface StatItem {
  label: string;
  value: string;
  sub?: string;
}

export interface WhySakaniItem {
  title: string;
  description: string;
  icon: string;
}

export interface HowItWorksItem {
  step: string;
  title: string;
  desc: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  working_hours?: string;
}

export interface SiteContent {
  hero_title?: string;
  hero_subtitle?: string;
  stats?: StatItem[];
  why_sakani?: WhySakaniItem[];
  how_it_works?: HowItWorksItem[];
  faq?: FAQItem[];
  contact_info?: ContactInfo;
  social_links?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    telegram?: string;
  };
}

export interface PropertyFilterState {
  search: string;
  university: string;
  area: string;
  minPrice: string;
  maxPrice: string;
  rooms: string;
  genderType: string;
  verifiedOnly: boolean;
}
