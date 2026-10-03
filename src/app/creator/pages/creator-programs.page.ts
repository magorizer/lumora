import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';

import { ProgramTemplateService } from '../../core/data/program-template.service';
import { ProgramPeriod, ProgramTemplate } from '../../core/models/content.models';

@Component({
  selector: 'app-creator-programs',
  standalone: true,
  templateUrl: './creator-programs.page.html',
  styleUrls: ['../creator-pages.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatorProgramsPage implements OnInit {
  readonly programs = inject(ProgramTemplateService);
  readonly selectedId = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.programs.load();
    this.selectedId.set(this.programs.templates()[0]?.id ?? null);
  }

  selected(): ProgramTemplate | null {
    return this.programs.templates().find((item) => item.id === this.selectedId()) ?? null;
  }

  select(id: string): void {
    this.selectedId.set(id);
  }

  create(): void {
    const created = this.programs.createTemplate();
    if (created) this.selectedId.set(created.id);
  }

  updateField(field: 'title' | 'subtitle' | 'description', event: Event): void {
    const selected = this.selected();
    if (!selected) return;
    this.programs.updateTemplateField(selected.id, field, (event.target as HTMLInputElement | HTMLTextAreaElement).value);
  }

  updateTrack(period: ProgramPeriod, event: Event): void {
    const selected = this.selected();
    if (!selected) return;
    this.programs.updateTemplateTrack(selected.id, period, (event.target as HTMLSelectElement).value);
  }
}
