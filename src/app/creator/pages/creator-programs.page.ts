import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';

import { ProgramTemplateService } from '../../core/data/program-template.service';
import { ProgramTemplate } from '../../core/models/content.models';

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

  addItem(): void {
    const selected = this.selected();
    if (selected) this.programs.addTemplateItem(selected.id);
  }

  removeItem(itemId: string): void {
    const selected = this.selected();
    if (selected) this.programs.removeTemplateItem(selected.id, itemId);
  }

  moveItem(itemId: string, direction: -1 | 1): void {
    const selected = this.selected();
    if (selected) this.programs.moveTemplateItem(selected.id, itemId, direction);
  }

  updateItemCourse(itemId: string, event: Event): void {
    const selected = this.selected();
    if (!selected) return;
    this.programs.updateTemplateItemCourse(selected.id, itemId, (event.target as HTMLSelectElement).value);
  }

  updateItemTime(itemId: string, event: Event): void {
    const selected = this.selected();
    if (!selected) return;
    this.programs.updateTemplateItemTime(selected.id, itemId, (event.target as HTMLSelectElement).value);
  }
}
