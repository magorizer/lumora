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
  sourceMode?: 'upload' | 'url';
  mediaUrl?: string;
  uploadName?: string;
  coverMode?: 'upload' | 'url';
  coverUrl?: string;
  coverUploadName?: string;
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
  requiresSequentialOrder?: boolean;
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


export type ProgramDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type ProgramPeriod = 'morning' | 'evening';

export type ProgramSequenceSessionType =
  | 'breathwork'
  | 'meditation'
  | 'affirmation'
  | 'nlp'
  | 'exercise';

export interface ProgramSequenceSession {
  position: number;
  title: string;
  type: ProgramSequenceSessionType;
  duration: string;
  description: string;
}

export interface ProgramSequence {
  id: string;
  title: string;
  creatorName: string;
  period: ProgramPeriod;
  description: string;
  sessions: ProgramSequenceSession[];
}

export interface ProgramTemplate {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  accent: 'amber' | 'blue' | 'sage';
  morningSequenceId: string;
  eveningSequenceId: string;
}

export interface ProgramTemplatesData {
  sequences: ProgramSequence[];
  templates: ProgramTemplate[];
}
