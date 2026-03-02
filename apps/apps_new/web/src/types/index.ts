export interface Participant {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  status: string | null;
  createdAt: Date | null;
  updatedAt?: Date | null;
  profession?: string | null;
  age?: number | null;
  experience?: string | null;
  goal?: string | null;
  preferredDates?: string | null;
  howHeard?: string | null;
}

export interface WorkshopStats {
  total_workshops: number;
  completed_workshops: number;
  upcoming_workshops: number;
  cancelled_workshops: number;
}

export interface Media {
  id: number;
  fileName: string;
  filePath: string;
  fileType?: string | null;
}

export interface Instructor {
  id: number;
  name: string;
  tagline?: string | null;
  bio?: string | null;
  photo?: Media | null;
}

export interface Workshop {
  id: number;
  title: string;
  description?: string | null;
  date: string;
  price: string | number;
  status: string;
  media?: Media | null;
  instructor?: Instructor | null;
  meta?: any;
}

export interface StudioDashboardData {
  header: {
    title: string;
    subtitle: string;
  };
  tabs: Array<{
    label: string;
    icon: string;
    url: string;
    active: boolean;
  }>;
  statistics: WorkshopStats;
  workshops: Workshop[];
}

export interface Lesson {
  id: number;
  title: string;
  desc: string;
  status: 'locked' | 'active' | 'completed';
}

export interface AcademyDashboardData {
  title: string;
  subtitle: string;
  lessons: Lesson[];
}

export interface DeliveryConfig {
  type: 'sameday' | '24h' | '48h' | '72u';
  cutoff?: string; // e.g. "13:00"
  weekly_on?: string[]; // e.g. ["mon", "tue", "wed", "thu", "fri"]
  avg_turnaround_hours?: number; // For 'sameday'
}

export interface Actor {
  id: number;
  first_name: string;
  last_name: string;
  display_name: string;
  slug: string;
  voice_score: number;
  total_sales?: number;
  price_unpaid: number;
  gender?: string;
  starting_price?: number;
  native_lang?: string;
  native_lang_id?: number; //  Harde koppeling naar languages.id
  extra_lang_ids?: number[]; //  Harde koppeling naar languages.id
  tone_ids?: number[]; //  Harde koppeling naar voice_tones.id
  country_id?: number; //  Harde koppeling naar countries.id
  gender_id?: number; //  Harde koppeling naar genders.id
  experience_level_id?: number; //  Harde koppeling naar experience_levels.id
  status_id?: number; //  Harde koppeling naar actor_statuses.id
  ai_enabled?: boolean;
  ai_tags?: string;
  price_ivr?: number;
  photo_url: string;
  tone_of_voice?: string;
  clients?: string;
  demos: Demo[];
  reviews?: any[];
  rates?: Record<string, any>;
  rates_raw?: Record<string, any>;
  price_tv_national?: number;
  price_tv_regional?: number;
  price_tv_local?: number;
  price_radio_national?: number;
  price_radio_regional?: number;
  price_radio_local?: number;
  price_podcast?: number;
  price_social_media?: number;
  delivery_days_min?: number;
  delivery_days_max?: number;
  cutoff_time?: string;
  availability?: any[];
  bio?: string;
  tagline?: string;
  extra_langs?: string;
  native_lang_label?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  status?: string;
  experienceLevel?: string;
  holiday_from?: string | null;
  holiday_till?: string | null;
  video_url?: string;
  actor_videos?: Array<{ url: string; name: string }>;
  menu_order?: number;
}

export interface Demo {
  id: number;
  title: string;
  audio_url: string;
  category: string;
  actor_id?: number; // 🛡️ CHRIS-PROTOCOL: ID-First Handshake
  actor_name?: string;
  actor_photo?: string;
  actor_lang?: string; //  New field for flag display
}

export interface SearchFilters {
  languages: string[];
  genders: string[];
  styles: string[];
}

export interface SearchResults {
  count: number;
  results: Actor[];
  filters: SearchFilters;
  reviews?: any[];
  reviewStats?: {
    averageRating: number;
    totalCount: number;
    distribution: Record<number, number>;
  };
  _handshake_languages?: any[]; // 🛡️ CHRIS-PROTOCOL: Relational languages for UI
  _nuclear?: boolean;
  _source?: string;
  _bridge_timestamp?: string;
  _v?: string;
}
