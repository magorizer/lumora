import { Injectable, inject, signal } from '@angular/core';

import { CourseRepository, CreatorRepository } from '../../core/data/repositories';
import { Course, CourseUnit, Instructor } from '../../core/models/content.models';

interface CreatorDraft {
  title: string;
  category: string;
  description: string;
  topics: string;
  goals: string;
  problems: string;
  level: string;
  totalDuration: string;
  bestTime: string;
  format: string;
  lessonReflection: 'off' | 'optional' | 'recommended';
  lessonReflectionPrompt: string;
  checkpointCadence: 'off' | 'biweekly' | 'monthly';
  reinforcementEnabled: 'yes' | 'no';
  reinforcementPrompt: string;
  morningCadence: 'daily' | 'every_2_days' | 'weekly';
}

@Injectable({ providedIn: 'root' })
export class CreatorCatalogService {
  private readonly courseRepository = inject(CourseRepository);
  private readonly creatorRepository = inject(CreatorRepository);

  readonly instructors = signal<Instructor[]>([]);
  readonly courses = signal<Course[]>([]);
  readonly selectedInstructorId = signal('');
  readonly selectedCourseId = signal<string | null>(null);
  readonly editingUnitId = signal<string | null>(null);
  readonly editingCourse = signal(false);
  readonly saveMessage = signal('');
  readonly fakeUploadName = signal('');

  readonly draft = signal<CreatorDraft>({
    title: 'Új fejlődési mini-kurzus',
    category: 'NLP · önismeret',
    description: 'Rövid, gyakorlati demo kurzus személyre szabott fejlődési utakhoz.',
    topics: 'önreflexió, állapotváltás, belső erőforrás',
    goals: 'önbizalom, fókusz, kapcsolati rugalmasság',
    problems: 'halogatás, belső feszültség, bizonytalanság',
    level: 'kezdő',
    totalDuration: '45 perc',
    bestTime: 'napközben',
    format: 'videó, hanganyag, gyakorlat',
    lessonReflection: 'optional',
    lessonReflectionPrompt: 'Mi volt ebből most a legfontosabb felismerésed?',
    checkpointCadence: 'biweekly',
    reinforcementEnabled: 'yes',
    reinforcementPrompt: 'Fogalmazz a felhasználó előrehaladásához illő rövid, hiteles megerősítést.',
    morningCadence: 'every_2_days',
  });

  async load(): Promise<void> {
    if (this.instructors().length) return;

    const catalog = await this.courseRepository.loadCatalog();
    this.instructors.set(catalog.instructors);
    this.courses.set(catalog.courses.map((course) => ({
      ...course,
      status: course.status ?? 'published',
    })));

    this.selectedInstructorId.set(catalog.instructors[0]?.id ?? '');
    this.selectedCourseId.set(catalog.courses[0]?.id ?? null);
  }

  instructor(): Instructor | null {
    return this.instructors().find((item) => item.id === this.selectedInstructorId()) ?? null;
  }

  instructorCourses(): Course[] {
    return this.courses().filter((item) => item.instructorId === this.selectedInstructorId());
  }

  courseById(id: string | null): Course | null {
    return id ? this.courses().find((item) => item.id === id) ?? null : null;
  }

  selectedCourse(): Course | null {
    return this.courseById(this.selectedCourseId());
  }

  editingUnit(): CourseUnit | null {
    const course = this.selectedCourse();
    const unitId = this.editingUnitId();
    return course?.units.find((unit) => unit.id === unitId) ?? null;
  }

  unitCount(): number {
    return this.instructorCourses().reduce((sum, course) => sum + course.units.length, 0);
  }

  courseThemeClass(id: string): string {
    const index = Math.max(0, this.courses().findIndex((course) => course.id === id));
    return `course-theme-${index % 6}`;
  }

  chooseInstructor(id: string): void {
    this.selectedInstructorId.set(id);
    this.selectedCourseId.set(this.courses().find((course) => course.instructorId === id)?.id ?? null);
    this.editingUnitId.set(null);
  }

  selectCourse(id: string): void {
    const course = this.courseById(id);
    this.selectedCourseId.set(id);

    if (course) {
      this.selectedInstructorId.set(course.instructorId);
    }

    this.editingUnitId.set(null);
    this.editingCourse.set(false);
    this.saveMessage.set('');
  }

  openCourseEditor(): void {
    this.editingCourse.set(true);
  }

  closeCourseEditor(): void {
    this.editingCourse.set(false);
  }

  openUnitEditor(unitId: string): void {
    this.editingUnitId.set(unitId);
  }

  closeUnitEditor(): void {
    this.editingUnitId.set(null);
  }

  updateCourse(
    field: 'title' | 'category' | 'description' | 'level' | 'totalDuration' | 'bestTime' | 'topics',
    event: Event,
  ): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
    const selectedId = this.selectedCourseId();

    this.courses.update((courses) =>
      courses.map((course) => {
        if (course.id !== selectedId) return course;
        if (field === 'topics') {
          return { ...course, topics: value.split(',').map((item) => item.trim()).filter(Boolean) };
        }

        return { ...course, [field]: value };
      }),
    );

    this.saveMessage.set('Kurzus módosítva a demóban.');
  }

  updateUnit(
    unitId: string,
    field: 'title' | 'type' | 'duration' | 'summary' | 'sourceMode' | 'mediaUrl' | 'coverMode' | 'coverUrl',
    event: Event,
  ): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;

    this.courses.update((courses) =>
      courses.map((course) => {
        if (course.id !== this.selectedCourseId()) return course;

        return {
          ...course,
          units: course.units.map((unit) => {
            if (unit.id !== unitId) return unit;

            if (field === 'type') return { ...unit, type: value as CourseUnit['type'] };
            if (field === 'sourceMode') return { ...unit, sourceMode: value as 'upload' | 'url' };
            if (field === 'coverMode') return { ...unit, coverMode: value as 'upload' | 'url' };
            if (field === 'title') return { ...unit, title: value };
            if (field === 'duration') return { ...unit, duration: value };
            if (field === 'summary') return { ...unit, summary: value };
            if (field === 'mediaUrl') return { ...unit, mediaUrl: value };
            return { ...unit, coverUrl: value };
          }),
        };
      }),
    );

    this.saveMessage.set('Módosítva a demóban.');
  }

  setUnitSourceMode(unitId: string, mode: 'upload' | 'url'): void {
    this.patchUnit(unitId, { sourceMode: mode });
  }

  setUnitCoverMode(unitId: string, mode: 'upload' | 'url'): void {
    this.patchUnit(unitId, { coverMode: mode });
  }

  fakeUnitUpload(unitId: string, target: 'media' | 'cover', event: Event): void {
    const input = event.target as HTMLInputElement;
    const fileName = input.files?.[0]?.name;
    if (!fileName) return;

    this.patchUnit(
      unitId,
      target === 'media'
        ? { sourceMode: 'upload', uploadName: fileName }
        : { coverMode: 'upload', coverUploadName: fileName },
    );

    this.saveMessage.set('Fájl kiválasztva a demóban.');
  }

  private patchUnit(unitId: string, patch: Partial<CourseUnit>): void {
    this.courses.update((courses) =>
      courses.map((course) =>
        course.id !== this.selectedCourseId()
          ? course
          : {
              ...course,
              units: course.units.map((unit) => unit.id === unitId ? { ...unit, ...patch } : unit),
            },
      ),
    );
  }

  updateDraft(field: keyof CreatorDraft, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
    this.draft.update((current) => ({ ...current, [field]: value }));
  }

  fakeUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fakeUploadName.set(input.files?.[0]?.name ?? 'demo-video.mp4');
  }

  async createCourse(): Promise<Course | null> {
    const instructor = this.instructor();
    if (!instructor) return null;

    const d = this.draft();
    const id = 'demo-' + Date.now();

    const course: Course = {
      id,
      instructorId: instructor.id,
      title: d.title,
      category: d.category,
      description: d.description,
      topics: d.topics.split(',').map((x) => x.trim()).filter(Boolean),
      format: d.format.split(',').map((x) => x.trim()).filter(Boolean),
      level: d.level,
      totalDuration: d.totalDuration,
      bestTime: d.bestTime,
      status: 'draft',
      recommendation: {
        goals: d.goals.split(',').map((x) => x.trim()).filter(Boolean),
        problems: d.problems.split(',').map((x) => x.trim()).filter(Boolean),
        preferredTimes: [d.bestTime],
      },
      engagement: {
        lessonReflection: d.lessonReflection,
        lessonReflectionPrompt: d.lessonReflectionPrompt,
        checkpointCadence: d.checkpointCadence,
        reinforcementEnabled: d.reinforcementEnabled === 'yes',
        reinforcementPrompt: d.reinforcementPrompt,
        morningCadence: d.morningCadence,
      },
      units: [
        {
          id: id + '-1',
          title: 'Bevezető videó',
          type: 'video',
          duration: '12 perc',
          summary: 'Rövid bevezetés a kurzus fő témájába.',
        },
        {
          id: id + '-2',
          title: 'Gyakorlati feladat',
          type: 'exercise',
          duration: '10 perc',
          summary: 'Egy rövid, kipróbálható gyakorlat.',
        },
      ],
    };

    const saved = await this.creatorRepository.saveDraft(course);
    this.courses.update((items) => [saved, ...items]);
    this.selectedCourseId.set(saved.id);
    this.saveMessage.set('Demo kurzus létrehozva.');
    return saved;
  }

  async publishSelected(): Promise<void> {
    const selected = this.selectedCourse();
    if (!selected) return;

    const published = await this.creatorRepository.publish(selected);
    this.courses.update((items) =>
      items.map((course) => course.id === published.id ? published : course),
    );
    this.saveMessage.set('Publikálva a demóban.');
  }
}
