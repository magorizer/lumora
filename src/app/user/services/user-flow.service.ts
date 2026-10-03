import { Injectable, computed, inject, signal } from '@angular/core';

import { CourseRepository, ProgramRepository } from '../../core/data/repositories';
import { Course, Instructor, ProgramScenario } from '../../core/models/content.models';

export interface UserAnswers {
  mainGoal: string;
  scenarioId: string;
  longTermGoal: string;
  situation: string;
  obstacles: string[];
  weeklyTime: string;
  formats: string[];
  pace: string;
  adjustment: string;
  adjustmentReason: string;
  rating: number;
  difficulty: string;
  change: string;
  note: string;
  taskResponse: string;
  lessonReflection: string;
  affirmationAccepted: boolean;
  affirmationText: string;
  completedLesson: boolean;
}

const initialAnswers: UserAnswers = {
  mainGoal: 'Önbizalom',
  scenarioId: 'confidence',
  longTermGoal: 'belső egyensúly',
  situation: 'már elindultam',
  obstacles: ['halogatás'],
  weeklyTime: '1 óra',
  formats: ['videó', 'vezetett gyakorlat', 'meditáció'],
  pace: 'kiegyensúlyozott',
  adjustment: 'más fókusz',
  adjustmentReason: 'más lett a prioritás',
  rating: 0,
  difficulty: '',
  change: '',
  note: '',
  taskResponse: '',
  lessonReflection: '',
  affirmationAccepted: false,
  affirmationText: 'Nyugodtan haladhatok a saját tempómban, és minden kis lépés számít.',
  completedLesson: false,
};

@Injectable({ providedIn: 'root' })
export class UserFlowService {
  private readonly programRepository = inject(ProgramRepository);
  private readonly courseRepository = inject(CourseRepository);

  private readonly scenarios = signal<ProgramScenario[]>([]);
  readonly instructors = signal<Instructor[]>([]);
  readonly courses = signal<Course[]>([]);
  readonly answers = signal<UserAnswers>(this.restoreAnswers());

  readonly scenario = computed(() => {
    const selected = this.scenarios().find((item) => item.id === this.answers().scenarioId);
    return selected ?? this.scenarios()[0] ?? null;
  });

  async load(): Promise<void> {
    if (this.scenarios().length && this.courses().length) return;
    const [programs, catalog] = await Promise.all([
      this.programRepository.loadPrograms(),
      this.courseRepository.loadCatalog(),
    ]);
    this.scenarios.set(programs.scenarios);
    this.instructors.set(catalog.instructors);
    this.courses.set(catalog.courses);
  }

  course(courseId?: string): Course | null {
    return courseId ? this.courses().find((item) => item.id === courseId) ?? null : null;
  }

  instructor(instructorId?: string): Instructor | null {
    return instructorId ? this.instructors().find((item) => item.id === instructorId) ?? null : null;
  }

  setMainGoal(goal: string, scenarioId: string): void {
    this.patch({ mainGoal: goal, scenarioId });
  }

  patch(patch: Partial<UserAnswers>): void {
    const next = { ...this.answers(), ...patch };
    this.answers.set(next);
    sessionStorage.setItem('portalumi-demo-answers', JSON.stringify(next));
  }

  toggleObstacle(value: string): void {
    const current = this.answers().obstacles;
    this.patch({ obstacles: current.includes(value) ? current.filter((item) => item !== value) : [...current, value] });
  }

  toggleFormat(value: string): void {
    const current = this.answers().formats;
    this.patch({ formats: current.includes(value) ? current.filter((item) => item !== value) : [...current, value] });
  }

  reset(): void {
    sessionStorage.removeItem('portalumi-demo-answers');
    this.answers.set({ ...initialAnswers });
  }

  private restoreAnswers(): UserAnswers {
    const raw = sessionStorage.getItem('portalumi-demo-answers');
    if (!raw) return { ...initialAnswers };
    try {
      return { ...initialAnswers, ...JSON.parse(raw) as Partial<UserAnswers> };
    } catch {
      return { ...initialAnswers };
    }
  }
}
