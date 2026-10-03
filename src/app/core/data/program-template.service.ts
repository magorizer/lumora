import { Injectable, computed, inject, signal } from '@angular/core';

import {
  ProgramDay,
  ProgramPeriod,
  ProgramSequence,
  ProgramTemplate,
  ProgramTemplatesData,
} from '../models/content.models';
import { ProgramTemplateRepository } from './repositories';

interface SavedProgramSelection {
  selectedTemplateId: string | null;
  morningSequenceId: string | null;
  eveningSequenceId: string | null;
  selectedDays: ProgramDay[];
}

@Injectable({ providedIn: 'root' })
export class ProgramTemplateService {
  private readonly repository = inject(ProgramTemplateRepository);
  private readonly storageKey = 'portalumi-demo-program-selection';
  private readonly editorStorageKey = 'portalumi-demo-program-templates';

  readonly sequences = signal<ProgramSequence[]>([]);
  readonly templates = signal<ProgramTemplate[]>([]);
  readonly selectedTemplateId = signal<string | null>(null);
  readonly morningSequenceId = signal<string | null>(null);
  readonly eveningSequenceId = signal<string | null>(null);
  readonly selectedDays = signal<ProgramDay[]>(['monday', 'wednesday', 'friday', 'sunday']);

  readonly selectedTemplate = computed(() =>
    this.templates().find((item) => item.id === this.selectedTemplateId()) ?? null,
  );

  readonly morningSequence = computed(() =>
    this.sequences().find((item) => item.id === this.morningSequenceId()) ?? null,
  );

  readonly eveningSequence = computed(() =>
    this.sequences().find((item) => item.id === this.eveningSequenceId()) ?? null,
  );

  async load(): Promise<void> {
    if (this.templates().length) return;

    const storedEditorData = sessionStorage.getItem(this.editorStorageKey);
    const stored = storedEditorData ? this.safeParseData(storedEditorData) : null;
    const data = stored ?? await this.repository.loadProgramTemplates();

    this.templates.set(data.templates);
    this.sequences.set(data.sequences);
    this.restoreSelection();

    if (!this.selectedTemplateId() && data.templates[0]) {
      this.selectTemplate(data.templates[0].id);
    }
  }

  selectTemplate(id: string): void {
    const template = this.templates().find((item) => item.id === id);
    if (!template) return;

    this.selectedTemplateId.set(template.id);
    this.morningSequenceId.set(template.morningSequenceId);
    this.eveningSequenceId.set(template.eveningSequenceId);
    this.persistSelection();
  }

  setTrack(period: ProgramPeriod, sequenceId: string): void {
    const sequence = this.sequences().find((item) => item.id === sequenceId && item.period === period);
    if (!sequence) return;

    if (period === 'morning') this.morningSequenceId.set(sequenceId);
    if (period === 'evening') this.eveningSequenceId.set(sequenceId);
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

  availableSequences(period: ProgramPeriod): ProgramSequence[] {
    return this.sequences().filter((item) => item.period === period);
  }

  updateTemplateField(id: string, field: 'title' | 'subtitle' | 'description', value: string): void {
    this.templates.update((templates) =>
      templates.map((template) => template.id === id ? { ...template, [field]: value } : template),
    );
    this.persistEditorData();
  }

  updateTemplateTrack(id: string, period: ProgramPeriod, sequenceId: string): void {
    this.templates.update((templates) =>
      templates.map((template) => {
        if (template.id !== id) return template;
        return period === 'morning'
          ? { ...template, morningSequenceId: sequenceId }
          : { ...template, eveningSequenceId: sequenceId };
      }),
    );

    if (this.selectedTemplateId() === id) {
      this.setTrack(period, sequenceId);
    }

    this.persistEditorData();
  }

  sequenceById(id: string): ProgramSequence | null {
    return this.sequences().find((item) => item.id === id) ?? null;
  }

  createTemplate(): ProgramTemplate | null {
    const morning = this.availableSequences('morning')[0];
    const evening = this.availableSequences('evening')[0];
    if (!morning || !evening) return null;

    const template: ProgramTemplate = {
      id: 'program-' + Date.now(),
      title: 'Új kész program',
      subtitle: 'Reggeli és esti felépített sorozat',
      description: 'A képző által összeállított, szerkeszthető programcsomag.',
      accent: 'amber',
      morningSequenceId: morning.id,
      eveningSequenceId: evening.id,
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

      if (template) this.selectedTemplateId.set(template.id);
      if (this.sequences().some((item) => item.id === saved.morningSequenceId && item.period === 'morning')) {
        this.morningSequenceId.set(saved.morningSequenceId);
      }
      if (this.sequences().some((item) => item.id === saved.eveningSequenceId && item.period === 'evening')) {
        this.eveningSequenceId.set(saved.eveningSequenceId);
      }
      if (Array.isArray(saved.selectedDays) && saved.selectedDays.length) {
        this.selectedDays.set(saved.selectedDays);
      }
    } catch {
      sessionStorage.removeItem(this.storageKey);
    }
  }

  private persistSelection(): void {
    const data: SavedProgramSelection = {
      selectedTemplateId: this.selectedTemplateId(),
      morningSequenceId: this.morningSequenceId(),
      eveningSequenceId: this.eveningSequenceId(),
      selectedDays: this.selectedDays(),
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

  private safeParseData(raw: string): ProgramTemplatesData | null {
    try {
      const parsed = JSON.parse(raw) as ProgramTemplatesData;
      if (Array.isArray(parsed.templates) && parsed.templates.length && Array.isArray(parsed.sequences) && parsed.sequences.length) {
        return parsed;
      }
    } catch {
      // fall back to the bundled demo JSON below
    }

    sessionStorage.removeItem(this.editorStorageKey);
    return null;
  }
}
