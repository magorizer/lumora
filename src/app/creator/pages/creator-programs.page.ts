import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';

import { ProgramContentOption, ProgramTemplateService } from '../../core/data/program-template.service';
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
  readonly searchQueries = signal<Record<string, string>>({});
  readonly draggedItemId = signal<string | null>(null);
  readonly draggedContentSlotKey = signal<string | null>(null);

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

  updateContentReplacement(event: Event): void {
    const selected = this.selected();
    if (!selected) return;
    this.programs.setTemplateContentReplacement(selected.id, (event.target as HTMLInputElement).checked);
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

  addContentSlot(itemId: string): void {
    const selected = this.selected();
    if (selected) this.programs.addTemplateContentSlot(selected.id, itemId);
  }

  removeContentSlot(itemId: string, slotId: string): void {
    const selected = this.selected();
    if (selected) this.programs.removeTemplateContentSlot(selected.id, itemId, slotId);
  }

  selectContentSlot(itemId: string, slotId: string, courseId: string, unitId: string): void {
    const selected = this.selected();
    if (!selected) return;
    this.programs.updateTemplateContentSlot(selected.id, itemId, slotId, courseId, unitId);
  }

  searchKey(itemId: string, slotId: string): string {
    return itemId + ':' + slotId;
  }

  setSearch(key: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQueries.update((queries) => ({ ...queries, [key]: value }));
  }

  searchQuery(key: string): string {
    return this.searchQueries()[key] ?? '';
  }

  searchResults(template: ProgramTemplate, key: string): ProgramContentOption[] {
    const query = this.searchQuery(key);
    if (!query.trim()) return [];
    return this.programs.searchContent(query, template);
  }

  dragStart(itemId: string, event: DragEvent): void {
    this.draggedItemId.set(itemId);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', itemId);
    }
  }

  dragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  drop(targetItemId: string, event: DragEvent): void {
    event.preventDefault();
    const selected = this.selected();
    const sourceItemId = this.draggedItemId() ?? event.dataTransfer?.getData('text/plain') ?? null;
    if (selected && sourceItemId) this.programs.moveTemplateItemTo(selected.id, sourceItemId, targetItemId);
    this.draggedItemId.set(null);
  }

  dragEnd(): void {
    this.draggedItemId.set(null);
  }

  contentDragStart(itemId: string, slotId: string, event: DragEvent): void {
    const key = this.searchKey(itemId, slotId);
    this.draggedContentSlotKey.set(key);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', key);
    }
    event.stopPropagation();
  }

  contentDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  contentDrop(itemId: string, targetSlotId: string, event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const selected = this.selected();
    const key = this.draggedContentSlotKey() ?? event.dataTransfer?.getData('text/plain') ?? '';
    const [sourceItemId, sourceSlotId] = key.split(':');
    if (selected && sourceItemId === itemId && sourceSlotId) {
      this.programs.moveTemplateContentSlotTo(selected.id, itemId, sourceSlotId, targetSlotId);
    }
    this.draggedContentSlotKey.set(null);
  }

  contentDragEnd(event: DragEvent): void {
    event.stopPropagation();
    this.draggedContentSlotKey.set(null);
  }
}
