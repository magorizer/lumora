import { Injectable, computed, inject, signal } from '@angular/core';

import { CourseRepository, ProgramTemplateRepository } from './repositories';
import {
  Course,
  Instructor,
  ProgramDay,
  ProgramPackageItem,
  ProgramSequence,
  ProgramTemplate,
  ProgramTemplatesData,
} from '../models/content.models';

interface SavedProgramSelection {
  selectedTemplateId: string | null;
  selectedItems: ProgramPackageItem[];
  selectedDays: ProgramDay[];
  started: boolean;
  currentPosition: number;
}

@Injectable({ providedIn: 'root' })
export class ProgramTemplateService {
  private readonly repository = inject(ProgramTemplateRepository);
  private readonly courseRepository = inject(CourseRepository);
  private readonly storageKey = 'portalumi-demo-program-selection';
  private readonly editorStorageKey = 'portalumi-demo-program-templates';

  readonly sequences = signal<ProgramSequence[]>([]);
  readonly templates = signal<ProgramTemplate[]>([]);
  readonly courses = signal<Course[]>([]);
  readonly instructors = signal<Instructor[]>([]);

  readonly selectedTemplateId = signal<string | null>(null);
  readonly selectedItems = signal<ProgramPackageItem[]>([]);
  readonly selectedDays = signal<ProgramDay[]>(['monday', 'wednesday', 'friday', 'sunday']);
  readonly started = signal(false);
  readonly currentPosition = signal(1);

  readonly packageTimeOptions = [
    'közvetlenül ébredés után',
    'reggel',
    'délelőtt',
    'ebéd körül',
    'napközben',
    'délután',
    'kora este',
    'este',
    'közvetlenül lefekvés előtt',
  ];

  readonly selectedTemplate = computed(() =>
    this.templates().find((item) => item.id === this.selectedTemplateId()) ?? null,
  );

  async load(): Promise<void> {
    if (this.templates().length && this.courses().length) return;

    const [fallbackData, catalog] = await Promise.all([
      this.repository.loadProgramTemplates(),
      this.courseRepository.loadCatalog(),
    ]);

    this.courses.set(catalog.courses);
    this.instructors.set(catalog.instructors);

    const storedEditorData = sessionStorage.getItem(this.editorStorageKey);
    const stored = storedEditorData ? this.safeParseData(storedEditorData) : null;
    const data = stored ?? fallbackData;

    this.templates.set(data.templates.map((template) => this.normalizeTemplate(template)));
    this.sequences.set(data.sequences);
    this.restoreSelection();
  }

  selectTemplate(id: string): void {
    const template = this.templates().find((item) => item.id === id);
    if (!template) return;

    this.selectedTemplateId.set(template.id);
    this.selectedItems.set(template.items.map((item) => ({ ...item })));
    this.started.set(false);
    this.currentPosition.set(1);
    this.persistSelection();
  }

  toggleDay(day: ProgramDay): void {
    const current = this.selectedDays();
    const next = current.includes(day)
      ? current.filter((item) => item !== day)
      : [...current, day];

    if (!next.length) return;

    this.selectedDays.set(next);
    this.persistSelection();
  }

  isDaySelected(day: ProgramDay): boolean {
    return this.selectedDays().includes(day);
  }

  updateTemplateField(id: string, field: 'title' | 'subtitle' | 'description', value: string): void {
    this.templates.update((templates) =>
      templates.map((template) => template.id === id ? { ...template, [field]: value } : template),
    );
    this.persistEditorData();
  }

  addTemplateItem(templateId: string): void {
    const firstCourse = this.courses()[0];
    if (!firstCourse) return;

    this.templates.update((templates) =>
      templates.map((template) => {
        if (template.id !== templateId) return template;
        const index = template.items.length;
        const timeLabel = this.packageTimeOptions[Math.min(index, this.packageTimeOptions.length - 1)] ?? 'reggel';
        return {
          ...template,
          items: [
            ...template.items,
            {
              id: 'package-item-' + Date.now(),
              courseId: firstCourse.id,
              timeLabel,
            },
          ],
        };
      }),
    );

    this.persistEditorData();
  }

  removeTemplateItem(templateId: string, itemId: string): void {
    this.templates.update((templates) =>
      templates.map((template) => {
        if (template.id !== templateId || template.items.length <= 1) return template;
        return { ...template, items: template.items.filter((item) => item.id !== itemId) };
      }),
    );

    this.persistEditorData();
  }

  moveTemplateItem(templateId: string, itemId: string, direction: -1 | 1): void {
    this.templates.update((templates) =>
      templates.map((template) => {
        if (template.id !== templateId) return template;
        const currentIndex = template.items.findIndex((item) => item.id === itemId);
        const targetIndex = currentIndex + direction;
        if (currentIndex < 0 || targetIndex < 0 || targetIndex >= template.items.length) return template;

        const items = [...template.items];
        [items[currentIndex], items[targetIndex]] = [items[targetIndex], items[currentIndex]];
        return { ...template, items };
      }),
    );

    this.persistEditorData();
  }

  updateTemplateItemCourse(templateId: string, itemId: string, courseId: string): void {
    if (!this.courseById(courseId)) return;

    this.templates.update((templates) =>
      templates.map((template) =>
        template.id !== templateId
          ? template
          : {
              ...template,
              items: template.items.map((item) => item.id === itemId ? { ...item, courseId } : item),
            },
      ),
    );

    this.persistEditorData();
  }

  updateTemplateItemTime(templateId: string, itemId: string, timeLabel: string): void {
    this.templates.update((templates) =>
      templates.map((template) =>
        template.id !== templateId
          ? template
          : {
              ...template,
              items: template.items.map((item) => item.id === itemId ? { ...item, timeLabel } : item),
            },
      ),
    );

    this.persistEditorData();
  }

  setSelectedItemCourse(itemId: string, courseId: string): void {
    if (!this.courseById(courseId)) return;
    this.selectedItems.update((items) =>
      items.map((item) => item.id === itemId ? { ...item, courseId } : item),
    );
    this.persistSelection();
  }

  courseById(id: string): Course | null {
    return this.courses().find((course) => course.id === id) ?? null;
  }

  instructorNameForCourse(course: Course): string {
    return this.instructors().find((instructor) => instructor.id === course.instructorId)?.name ?? 'Előadó';
  }

  currentUnit(item: ProgramPackageItem) {
    const course = this.courseById(item.courseId);
    if (!course?.units.length) return null;

    const rawIndex = Math.max(0, this.currentPosition() - 1);
    const index = course.requiresSequentialOrder === false
      ? rawIndex % course.units.length
      : Math.min(rawIndex, course.units.length - 1);

    return course.units[index] ?? null;
  }

  sequenceById(id: string): ProgramSequence | null {
    return this.sequences().find((item) => item.id === id) ?? null;
  }

  startProgram(): void {
    if (!this.selectedTemplate()) return;
    this.started.set(true);
    if (this.currentPosition() < 1) this.currentPosition.set(1);
    this.persistSelection();
  }

  setCurrentPosition(position: number): void {
    this.currentPosition.set(Math.min(12, Math.max(1, position)));
    this.persistSelection();
  }

  clearUserProgram(): void {
    this.selectedTemplateId.set(null);
    this.selectedItems.set([]);
    this.started.set(false);
    this.currentPosition.set(1);
    sessionStorage.removeItem(this.storageKey);
  }

  createTemplate(): ProgramTemplate | null {
    const firstCourse = this.courses()[0];
    if (!firstCourse) return null;

    const template: ProgramTemplate = {
      id: 'package-' + Date.now(),
      title: 'Új csomag',
      subtitle: 'Saját összeállítás feltöltött kurzusokból',
      description: 'A képző által összeállított, szerkeszthető programcsomag.',
      accent: 'amber',
      items: [
        {
          id: 'package-item-' + Date.now(),
          courseId: firstCourse.id,
          timeLabel: 'reggel',
        },
      ],
    };

    this.templates.update((items) => [template, ...items]);
    this.persistEditorData();
    return template;
  }

  private restoreSelection(): void {
    const raw = sessionStorage.getItem(this.storageKey);
    if (!raw) return;

    try {
      const saved = JSON.parse(raw) as SavedProgramSelection;
      const template = this.templates().find((item) => item.id === saved.selectedTemplateId);

      if (template) {
        this.selectedTemplateId.set(template.id);
        const validSavedItems = Array.isArray(saved.selectedItems)
          ? saved.selectedItems.filter((item) => this.courseById(item.courseId))
          : [];
        this.selectedItems.set(
          validSavedItems.length
            ? validSavedItems.map((item) => ({ ...item }))
            : template.items.map((item) => ({ ...item })),
        );
      }

      if (Array.isArray(saved.selectedDays) && saved.selectedDays.length) {
        this.selectedDays.set(saved.selectedDays);
      }

      this.started.set(Boolean(saved.started));
      if (Number.isFinite(saved.currentPosition)) {
        this.currentPosition.set(Math.min(12, Math.max(1, Number(saved.currentPosition))));
      }
    } catch {
      sessionStorage.removeItem(this.storageKey);
    }
  }

  private persistSelection(): void {
    const data: SavedProgramSelection = {
      selectedTemplateId: this.selectedTemplateId(),
      selectedItems: this.selectedItems(),
      selectedDays: this.selectedDays(),
      started: this.started(),
      currentPosition: this.currentPosition(),
    };
    sessionStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  private persistEditorData(): void {
    const data: ProgramTemplatesData = {
      templates: this.templates(),
      sequences: this.sequences(),
    };
    sessionStorage.setItem(this.editorStorageKey, JSON.stringify(data));
  }

  private normalizeTemplate(template: ProgramTemplate): ProgramTemplate {
    if (Array.isArray(template.items) && template.items.length) return template;

    const legacyCourseMap: Record<string, string> = {
      'energy-breathwork-morning': 'morning-focus-5',
      'energy-dispenza-evening': 'nlp-evening-meditation',
      'confidence-morning': 'confidence-in-action',
      'confidence-nlp-evening': 'nlp-evening-meditation',
      'calm-morning': 'stress-reset',
      'calm-evening': 'nlp-evening-meditation',
    };

    const items: ProgramPackageItem[] = [];
    if (template.morningSequenceId && legacyCourseMap[template.morningSequenceId]) {
      items.push({
        id: template.id + '-morning',
        courseId: legacyCourseMap[template.morningSequenceId],
        timeLabel: 'reggel',
      });
    }
    if (template.eveningSequenceId && legacyCourseMap[template.eveningSequenceId]) {
      items.push({
        id: template.id + '-evening',
        courseId: legacyCourseMap[template.eveningSequenceId],
        timeLabel: 'este',
      });
    }

    if (!items.length && this.courses()[0]) {
      items.push({
        id: template.id + '-default',
        courseId: this.courses()[0].id,
        timeLabel: 'reggel',
      });
    }

    return { ...template, items };
  }

  private safeParseData(raw: string): ProgramTemplatesData | null {
    try {
      const parsed = JSON.parse(raw) as ProgramTemplatesData;
      if (Array.isArray(parsed.templates) && parsed.templates.length && Array.isArray(parsed.sequences)) {
        return parsed;
      }
    } catch {
      // fall back to bundled demo JSON
    }

    sessionStorage.removeItem(this.editorStorageKey);
    return null;
  }
}
