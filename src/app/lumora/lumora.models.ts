export interface LifeArea {
  id: number;
  slug: string;
  name: string;
  icon?: string | null;
}

export interface Goal {
  id: number;
  title: string;
  why?: string | null;
  progress: number;
  status: 'active' | 'completed' | 'archived';
  target_date?: string | null;
  life_area?: LifeArea | null;
  actions?: ActionItem[];
}

export interface Checkin {
  id: number;
  checkin_date: string;
  mood: string;
  energy: number;
  energizers: string[];
  drainers: string[];
  note?: string | null;
  life_areas: LifeArea[];
  goals: Pick<Goal, 'id' | 'title'>[];
}

export interface MemoryItem {
  id: number;
  category: 'insight' | 'value' | 'person' | 'preference' | 'resource' | 'context';
  title?: string | null;
  content: string;
  is_pinned: boolean;
  created_at: string;
}

export interface ActionItem {
  id: number;
  title: string;
  status: 'open' | 'completed';
  due_date?: string | null;
  completed_at?: string | null;
  goal?: Pick<Goal, 'id' | 'title'> | null;
}

export interface PatternItem {
  id: number;
  type: string;
  title: string;
  summary: string;
  evidence: Record<string, unknown>;
  confidence: number;
  status: 'active' | 'confirmed' | 'dismissed';
  last_detected_at?: string | null;
}

export interface WeeklyReviewSummary {
  week_end: string;
  checkin_count: number;
  mood_distribution: Record<string, { count: number; percent: number }>;
  average_energy: number | null;
  life_areas: Record<string, number>;
  energizers: Record<string, number>;
  drainers: Record<string, number>;
  actions_completed: number;
  actions_created: number;
  goal_progress: Array<{ id: number; title: string; progress: number }>;
  patterns: Array<{ id: number; title: string; summary: string; confidence: number }>;
}

export interface WeeklyReview {
  id: number;
  week_start: string;
  summary: WeeklyReviewSummary;
  focus_life_area_id?: number | null;
  focus_goal_id?: number | null;
  focus_note?: string | null;
  focus_life_area?: LifeArea | null;
  focus_goal?: Pick<Goal, 'id' | 'title'> | null;
}

export interface Dashboard {
  onboarding_completed: boolean;
  today_checkin: Checkin | null;
  active_goals: Goal[];
  open_actions: ActionItem[];
  recent_patterns: PatternItem[];
  weekly_review: WeeklyReview;
}

export interface OnboardingState {
  completed: boolean;
  reflection_style: 'gentle' | 'balanced' | 'direct';
  timezone?: string;
  life_area_ids: number[];
  goals: Goal[];
}
