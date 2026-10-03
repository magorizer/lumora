export type PortalumiRole = 'user' | 'content_creator';

export interface PortalumiUser {
  id: string;
  name: string;
  email: string;
  roles: PortalumiRole[];
  activeRole: PortalumiRole;
}

export interface ProgramItem {
  type: 'video' | 'audio' | 'exercise' | 'feedback' | 'meditation';
  title: string;
  duration?: string;
  courseId?: string;
  unitId?: string;
  timeOfDay?: 'morning' | 'daytime' | 'evening';
  cadence?: string;
}

export interface ProgramRoutine {
  period: 'Reggel' | 'Napközben' | 'Lefekvés előtt';
  title: string;
  courseId: string;
  duration: string;
  frequency: string;
  note: string;
}

export interface ProgramWeek {
  week: number;
  month: number;
  title: string;
  focus: string;
  items: ProgramItem[];
}

export interface ProgramScenario {
  id: string;
  title: string;
  subtitle: string;
  focus: string;
  summary: string;
  dailyRoutines: ProgramRoutine[];
  weeks: ProgramWeek[];
  nextCycle: {
    focus: string;
    description: string;
    weeklyTime: string;
    format: string;
    steps: string[];
  };
}

export interface ProgramData { scenarios: ProgramScenario[]; }

export interface Instructor {
  id: string;
  name: string;
  role: string;
  specialty: string;
  bio: string;
  courseIds: string[];
}

export interface CourseUnit {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'exercise' | 'meditation';
  duration: string;
  summary?: string;
}

export interface RecommendationMetadata {
  goals?: string[];
  problems?: string[];
  preferredTimes?: string[];
  prerequisites?: string[];
}

export interface CourseEngagementSettings {
  lessonReflection: 'off' | 'optional' | 'recommended';
  lessonReflectionPrompt?: string;
  checkpointCadence: 'off' | 'biweekly' | 'monthly';
  reinforcementEnabled: boolean;
  reinforcementPrompt?: string;
  morningCadence?: 'daily' | 'every_2_days' | 'weekly';
}

export interface Course {
  id: string;
  instructorId: string;
  title: string;
  category: string;
  topics: string[];
  description: string;
  format: string[];
  level: string;
  totalDuration: string;
  bestTime: string;
  units: CourseUnit[];
  status?: 'published' | 'draft';
  recommendation?: RecommendationMetadata;
  engagement?: CourseEngagementSettings;
}

export interface Catalog {
  instructors: Instructor[];
  courses: Course[];
}

export interface UsersData { users: PortalumiUser[]; }
