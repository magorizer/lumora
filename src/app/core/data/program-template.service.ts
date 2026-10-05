import { Injectable, computed, inject, signal } from '@angular/core';

import { CourseRepository, ProgramTemplateRepository } from './repositories';
import {
  Course,
  CourseUnit,
  Instructor,
  ProgramContentSlot,
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

export interface ProgramContentOption {
  course: Course;
  unit: CourseUnit;
}

@Injectable({ providedIn: 'root' })
export class ProgramTemplateService {
  private readonly repository = inject(ProgramTemplateRepository);
  private readonly courseRepository = inject(CourseRepository);
  private readonly storageKey = 'portalumi-demo-program-selection-v2';
  private readonly editorStorageKey = 'portalumi-demo-program-templates-v2';

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
    this.selectedItems.set(template.items.map((item) => this.clonePackageItem(item)));
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

  setTemplateContentReplacement(templateId: string, enabled: boolean): void {
    this.templates.update((templates) =>
      templates.map((template) => template.id === templateId
        ? { ...template, allowContentReplacement: enabled }
        : template),
    );
    this.persistEditorData();
  }

  addTemplateItem(templateId: string): void {
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
              timeLabel,
              contentSlots: [],
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
        const current = items[currentIndex];
        const target = items[targetIndex];
        if (!current || !target) return template;
        items[currentIndex] = target;
        items[targetIndex] = current;
        return { ...template, items };
      }),
    );
    this.persistEditorData();
  }

  moveTemplateItemTo(templateId: string, itemId: string, targetItemId: string): void {
    if (itemId === targetItemId) return;
    this.templates.update((templates) =>
      templates.map((template) => template.id === templateId
        ? { ...template, items: this.reorderItems(template.items, itemId, targetItemId) }
        : template),
    );
    this.persistEditorData();
  }

  updateTemplateItemCourse(templateId: string, itemId: string, courseId: string): void {
    const course = courseId ? this.courseById(courseId) : null;
    if (courseId && !course) return;

    this.templates.update((templates) =>
      templates.map((template) => template.id !== templateId
        ? template
        : {
            ...template,
            items: template.items.map((item) => {
              if (item.id !== itemId) return item;
              if (!course) return { id: item.id, timeLabel: item.timeLabel, contentSlots: [] };
              return {
                ...item,
                courseId: course.id,
                unitId: undefined,
                contentSlots: this.contentSlotsForCourse(item.id, course),
              };
            }),
          }),
    );
    this.persistEditorData();
  }

  updateTemplateItemTime(templateId: string, itemId: string, timeLabel: string): void {
    this.templates.update((templates) =>
      templates.map((template) => template.id !== templateId
        ? template
        : {
            ...template,
            items: template.items.map((item) => item.id === itemId ? { ...item, timeLabel } : item),
          }),
    );
    this.persistEditorData();
  }

  canEditItemContents(template: ProgramTemplate, item: ProgramPackageItem): boolean {
    if (template.allowContentReplacement === false) return false;
    if (!item.courseId) return true;
    return this.courseById(item.courseId)?.requiresSequentialOrder === false;
  }

  addTemplateContentSlot(templateId: string, itemId: string): void {
    const template = this.templates().find((candidate) => candidate.id === templateId);
    const item = template?.items.find((candidate) => candidate.id === itemId);
    if (!template || !item || !this.canEditItemContents(template, item)) return;

    this.templates.update((templates) =>
      templates.map((candidate) => candidate.id !== templateId
        ? candidate
        : {
            ...candidate,
            items: candidate.items.map((packageItem) => packageItem.id !== itemId
              ? packageItem
              : {
                  ...packageItem,
                  contentSlots: [
                    ...(packageItem.contentSlots ?? []),
                    { id: 'content-slot-' + Date.now() },
                  ],
                }),
          }),
    );
    this.persistEditorData();
  }

  removeTemplateContentSlot(templateId: string, itemId: string, slotId: string): void {
    const template = this.templates().find((candidate) => candidate.id === templateId);
    const item = template?.items.find((candidate) => candidate.id === itemId);
    if (!template || !item || !this.canEditItemContents(template, item)) return;

    this.templates.update((templates) =>
      templates.map((candidate) => candidate.id !== templateId
        ? candidate
        : {
            ...candidate,
            items: candidate.items.map((packageItem) => packageItem.id !== itemId
              ? packageItem
              : {
                  ...packageItem,
                  contentSlots: (packageItem.contentSlots ?? []).filter((slot) => slot.id !== slotId),
                }),
          }),
    );
    this.persistEditorData();
  }

  updateTemplateContentSlot(templateId: string, itemId: string, slotId: string, courseId: string, unitId: string): void {
    const template = this.templates().find((candidate) => candidate.id === templateId);
    const item = template?.items.find((candidate) => candidate.id === itemId);
    const course = this.courseById(courseId);
    const unit = course?.units.find((candidate) => candidate.id === unitId);
    if (!template || !item || !course || !unit) return;
    if (!this.canEditItemContents(template, item) || !this.canUseSpecificContent(template, course, unit)) return;

    this.templates.update((templates) =>
      templates.map((candidate) => candidate.id !== templateId
        ? candidate
        : {
            ...candidate,
            items: candidate.items.map((packageItem) => packageItem.id !== itemId
              ? packageItem
              : {
                  ...packageItem,
                  contentSlots: (packageItem.contentSlots ?? []).map((slot) =>
                    slot.id === slotId ? { ...slot, courseId, unitId } : slot),
                }),
          }),
    );
    this.persistEditorData();
  }

  moveTemplateContentSlotTo(templateId: string, itemId: string, slotId: string, targetSlotId: string): void {
    if (slotId === targetSlotId) return;
    const template = this.templates().find((candidate) => candidate.id === templateId);
    const item = template?.items.find((candidate) => candidate.id === itemId);
    if (!template || !item || !this.canEditItemContents(template, item)) return;

    this.templates.update((templates) =>
      templates.map((candidate) => candidate.id !== templateId
        ? candidate
        : {
            ...candidate,
            items: candidate.items.map((packageItem) => packageItem.id !== itemId
              ? packageItem
              : {
                  ...packageItem,
                  contentSlots: this.reorderContentSlots(packageItem.contentSlots ?? [], slotId, targetSlotId),
                }),
          }),
    );
    this.persistEditorData();
  }

  setSelectedItemCourse(itemId: string, courseId: string): void {
    const course = courseId ? this.courseById(courseId) : null;
    if (courseId && !course) return;
    this.selectedItems.update((items) =>
      items.map((item) => {
        if (item.id !== itemId) return item;
        if (!course) return { id: item.id, timeLabel: item.timeLabel, contentSlots: [] };
        return {
          ...item,
          courseId: course.id,
          unitId: undefined,
          contentSlots: this.contentSlotsForCourse(item.id, course),
        };
      }),
    );
    this.persistSelection();
  }

  addSelectedContentSlot(itemId: string): void {
    const template = this.selectedTemplate();
    const item = this.selectedItems().find((candidate) => candidate.id === itemId);
    if (!template || !item || !this.canEditItemContents(template, item)) return;
    this.selectedItems.update((items) =>
      items.map((candidate) => candidate.id !== itemId
        ? candidate
        : {
            ...candidate,
            contentSlots: [...(candidate.contentSlots ?? []), { id: 'content-slot-' + Date.now() }],
          }),
    );
    this.persistSelection();
  }

  removeSelectedContentSlot(itemId: string, slotId: string): void {
    const template = this.selectedTemplate();
    const item = this.selectedItems().find((candidate) => candidate.id === itemId);
    if (!template || !item || !this.canEditItemContents(template, item)) return;
    this.selectedItems.update((items) =>
      items.map((candidate) => candidate.id !== itemId
        ? candidate
        : {
            ...candidate,
            contentSlots: (candidate.contentSlots ?? []).filter((slot) => slot.id !== slotId),
          }),
    );
    this.persistSelection();
  }

  setSelectedContentSlot(itemId: string, slotId: string, courseId: string, unitId: string): void {
    const template = this.selectedTemplate();
    const item = this.selectedItems().find((candidate) => candidate.id === itemId);
    const course = this.courseById(courseId);
    const unit = course?.units.find((candidate) => candidate.id === unitId);
    if (!template || !item || !course || !unit) return;
    if (!this.canEditItemContents(template, item) || !this.canUseSpecificContent(template, course, unit)) return;

    this.selectedItems.update((items) =>
      items.map((candidate) => candidate.id !== itemId
        ? candidate
        : {
            ...candidate,
            contentSlots: (candidate.contentSlots ?? []).map((slot) =>
              slot.id === slotId ? { ...slot, courseId, unitId } : slot),
          }),
    );
    this.persistSelection();
  }

  moveSelectedContentSlotTo(itemId: string, slotId: string, targetSlotId: string): void {
    if (slotId === targetSlotId) return;
    const template = this.selectedTemplate();
    const item = this.selectedItems().find((candidate) => candidate.id === itemId);
    if (!template || !item || !this.canEditItemContents(template, item)) return;
    this.selectedItems.update((items) =>
      items.map((candidate) => candidate.id !== itemId
        ? candidate
        : {
            ...candidate,
            contentSlots: this.reorderContentSlots(candidate.contentSlots ?? [], slotId, targetSlotId),
          }),
    );
    this.persistSelection();
  }

  moveSelectedItemTo(itemId: string, targetItemId: string): void {
    if (itemId === targetItemId) return;
    this.selectedItems.update((items) => this.reorderItems(items, itemId, targetItemId));
    this.persistSelection();
  }

  courseById(id?: string): Course | null {
    if (!id) return null;
    return this.courses().find((course) => course.id === id) ?? null;
  }

  contentForSlot(slot: ProgramContentSlot): ProgramContentOption | null {
    const course = this.courseById(slot.courseId);
    const unit = course?.units.find((candidate) => candidate.id === slot.unitId);
    return course && unit ? { course, unit } : null;
  }

  unitForItem(item: ProgramPackageItem): CourseUnit | null {
    const course = this.courseById(item.courseId);
    if (!course || !item.unitId) return null;
    return course.units.find((unit) => unit.id === item.unitId) ?? null;
  }

  instructorNameForCourse(course: Course): string {
    return this.instructors().find((instructor) => instructor.id === course.instructorId)?.name ?? 'Előadó';
  }

  canUseSpecificContent(template: ProgramTemplate, course: Course, unit: CourseUnit): boolean {
    if (template.allowContentReplacement === false) return false;
    return course.requiresSequentialOrder === false || unit.standaloneAllowed === true;
  }

  searchContent(query: string, template: ProgramTemplate, limit = 40): ProgramContentOption[] {
    if (template.allowContentReplacement === false) return [];
    const needle = query.trim().toLocaleLowerCase('hu-HU');
    const results: ProgramContentOption[] = [];

    for (const course of this.courses()) {
      const instructor = this.instructorNameForCourse(course);
      for (const unit of course.units) {
        if (!this.canUseSpecificContent(template, course, unit)) continue;
        const searchable = [course.title, course.category, instructor, unit.title, unit.type]
          .join(' ')
          .toLocaleLowerCase('hu-HU');
        if (needle && !searchable.includes(needle)) continue;
        results.push({ course, unit });
        if (results.length >= limit) return results;
      }
    }
    return results;
  }

  currentContent(item: ProgramPackageItem): ProgramContentOption | null {
    const slots = (item.contentSlots ?? [])
      .map((slot) => this.contentForSlot(slot))
      .filter((content): content is ProgramContentOption => content !== null);

    if (slots.length) {
      const rawIndex = Math.max(0, this.currentPosition() - 1);
      const sourceCourse = this.courseById(item.courseId);
      const isSequential = Boolean(sourceCourse?.requiresSequentialOrder);
      const index = isSequential ? Math.min(rawIndex, slots.length - 1) : rawIndex % slots.length;
      return slots[index] ?? null;
    }

    const course = this.courseById(item.courseId);
    if (!course?.units.length) return null;
    if (item.unitId) {
      const unit = course.units.find((candidate) => candidate.id === item.unitId);
      return unit ? { course, unit } : null;
    }

    const rawIndex = Math.max(0, this.currentPosition() - 1);
    const index = course.requiresSequentialOrder === false
      ? rawIndex % course.units.length
      : Math.min(rawIndex, course.units.length - 1);
    const unit = course.units[index];
    return unit ? { course, unit } : null;
  }

  currentUnit(item: ProgramPackageItem): CourseUnit | null {
    return this.currentContent(item)?.unit ?? null;
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
    const firstCourse = this.courses().find((course) => course.requiresSequentialOrder === false) ?? this.courses()[0];
    if (!firstCourse) return null;
    const itemId = 'package-item-' + Date.now();
    const template: ProgramTemplate = {
      id: 'package-' + Date.now(),
      title: 'Új csomag',
      subtitle: 'Saját összeállítás feltöltött kurzusokból',
      description: 'A képző által összeállított, szerkeszthető programcsomag.',
      accent: 'amber',
      allowContentReplacement: true,
      items: [
        {
          id: itemId,
          courseId: firstCourse.id,
          timeLabel: 'reggel',
          contentSlots: this.contentSlotsForCourse(itemId, firstCourse),
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
          ? saved.selectedItems.filter((item) => !item.courseId || this.courseById(item.courseId))
          : [];
        this.selectedItems.set(
          validSavedItems.length
            ? validSavedItems.map((item) => this.normalizePackageItem(item))
            : template.items.map((item) => this.clonePackageItem(item)),
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
    if (Array.isArray(template.items) && template.items.length) {
      return {
        ...template,
        allowContentReplacement: template.allowContentReplacement !== false,
        items: template.items.map((item) => this.normalizePackageItem(item)),
      };
    }

    const legacyCourseMap: Record<string, string> = {
      'energy-breathwork-morning': 'morning-focus-5',
      'energy-dispenza-evening': 'nlp-evening-meditation',
      'confidence-morning': 'confidence-in-action',
      'confidence-nlp-evening': 'nlp-evening-meditation',
      'calm-morning': 'stress-reset',
      'calm-evening': 'nlp-evening-meditation',
    };

    const items: ProgramPackageItem[] = [];
    const addLegacyItem = (suffix: string, courseId: string, timeLabel: string): void => {
      const course = this.courseById(courseId);
      if (!course) return;
      const id = template.id + '-' + suffix;
      items.push({ id, courseId, timeLabel, contentSlots: this.contentSlotsForCourse(id, course) });
    };

    if (template.morningSequenceId && legacyCourseMap[template.morningSequenceId]) {
      addLegacyItem('morning', legacyCourseMap[template.morningSequenceId], 'reggel');
    }
    if (template.eveningSequenceId && legacyCourseMap[template.eveningSequenceId]) {
      addLegacyItem('evening', legacyCourseMap[template.eveningSequenceId], 'este');
    }

    const firstCourse = this.courses()[0];
    if (!items.length && firstCourse) {
      const id = template.id + '-default';
      items.push({
        id,
        courseId: firstCourse.id,
        timeLabel: 'reggel',
        contentSlots: this.contentSlotsForCourse(id, firstCourse),
      });
    }
    return { ...template, allowContentReplacement: true, items };
  }

  private normalizePackageItem(item: ProgramPackageItem): ProgramPackageItem {
    const course = this.courseById(item.courseId);
    if (!course) {
      return {
        id: item.id,
        timeLabel: item.timeLabel,
        contentSlots: (item.contentSlots ?? []).map((slot) => this.normalizeContentSlot(slot)),
      };
    }

    if (Array.isArray(item.contentSlots)) {
      return {
        ...item,
        contentSlots: item.contentSlots.map((slot) => this.normalizeContentSlot(slot)),
      };
    }

    if (item.unitId) {
      return {
        ...item,
        contentSlots: [{ id: item.id + '-content-0', courseId: course.id, unitId: item.unitId }],
      };
    }

    return { ...item, contentSlots: this.contentSlotsForCourse(item.id, course) };
  }

  private normalizeContentSlot(slot: ProgramContentSlot): ProgramContentSlot {
    const course = this.courseById(slot.courseId);
    if (!course || !slot.unitId || !course.units.some((unit) => unit.id === slot.unitId)) {
      return { id: slot.id };
    }
    return { ...slot };
  }

  private clonePackageItem(item: ProgramPackageItem): ProgramPackageItem {
    return {
      ...item,
      contentSlots: item.contentSlots?.map((slot) => ({ ...slot })),
    };
  }

  private contentSlotsForCourse(itemId: string, course: Course): ProgramContentSlot[] {
    return course.units.map((unit, index) => ({
      id: itemId + '-content-' + index + '-' + unit.id,
      courseId: course.id,
      unitId: unit.id,
    }));
  }

  private reorderItems(items: ProgramPackageItem[], itemId: string, targetItemId: string): ProgramPackageItem[] {
    const sourceIndex = items.findIndex((item) => item.id === itemId);
    const targetIndex = items.findIndex((item) => item.id === targetItemId);
    if (sourceIndex < 0 || targetIndex < 0) return items;
    const next = [...items];
    const moved = next[sourceIndex];
    if (!moved) return items;
    next.splice(sourceIndex, 1);
    const insertionIndex = next.findIndex((item) => item.id === targetItemId);
    next.splice(insertionIndex < 0 ? next.length : insertionIndex, 0, moved);
    return next;
  }

  private reorderContentSlots(slots: ProgramContentSlot[], slotId: string, targetSlotId: string): ProgramContentSlot[] {
    const sourceIndex = slots.findIndex((slot) => slot.id === slotId);
    const targetIndex = slots.findIndex((slot) => slot.id === targetSlotId);
    if (sourceIndex < 0 || targetIndex < 0) return slots;
    const next = [...slots];
    const moved = next[sourceIndex];
    if (!moved) return slots;
    next.splice(sourceIndex, 1);
    const insertionIndex = next.findIndex((slot) => slot.id === targetSlotId);
    next.splice(insertionIndex < 0 ? next.length : insertionIndex, 0, moved);
    return next;
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
