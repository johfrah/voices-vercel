export interface Participant {
  id: number;
  firstName: string;
  lastName: string;
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

export interface Actor {
  id: number;
  first_name: string;
  last_name: string;
  display_name: string;
  slug: string;
  voice_score: number;
  price_unpaid: number;
  gender?: string;
  starting_price?: number;
  native_lang?: string;
  ai_enabled?: boolean;
  ai_tags?: string;
  price_ivr?: number;
  photo_url: string;
  tone_of_voice?: string;
  clients?: string;
  demos: Demo[];
  reviews?: any[];
  rates_raw?: Record<string, any>;
  delivery_days_min?: number;
  delivery_days_max?: number;
  cutoff_time?: string;
  availability?: any[];
  bio?: string;
  tagline?: string;
  extra_langs?: string;
}

export interface Demo {
  id: number;
  title: string;
  audio_url: string;
  category: string;
  actor_name?: string;
  actor_photo?: string;
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
  _nuclear?: boolean;
  _source?: string;
  _bridge_timestamp?: string;
}
