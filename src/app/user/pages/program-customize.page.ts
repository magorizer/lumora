import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ProgramContentOption, ProgramTemplateService } from '../../core/data/program-template.service';
import { ProgramDay, ProgramTemplate } from '../../core/models/content.models';

interface DayOption {
  id: ProgramDay;
  short: string;
  label: string;
}

@Component({
  selector: 'app-program-customize',
  standalone: true,
  templateUrl: './program-customize.page.html',
  styleUrls: ['../user-pages.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramCustomizePage implements OnInit {
  readonly programs = inject(ProgramTemplateService);
  private readonly router = inject(Router);
  readonly searchQueries = signal<Record<string, string>>({});
  readonly draggedItemId = signal<string | null>(null);
  readonly draggedContentSlotKey = signal<string | null>(null);

  readonly days: DayOption[] = [
    { id: 'monday', short: 'H', label: 'Hétfő' },
    { id: 'tuesday', short: 'K', label: 'Kedd' },
    { id: 'wednesday', short: 'Sze', label: 'Szerda' },
    { id: 'thursday', short: 'Cs', label: 'Csütörtök' },
    { id: 'friday', short: 'P', label: 'Péntek' },
    { id: 'saturday', short: 'Szo', label: 'Szombat' },
    { id: 'sunday', short: 'V', label: 'Vasárnap' },
  ];

  async ngOnInit(): Promise<void> {
    await this.programs.load();
  }

  changeCourse(itemId: string, event: Event): void {
    this.programs.setSelectedItemCourse(itemId, (event.target as HTMLSelectElement).value);
  }

  addContentSlot(itemId: string): void {
    this.programs.addSelectedContentSlot(itemId);
  }

  removeContentSlot(itemId: string, slotId: string): void {
    this.programs.removeSelectedContentSlot(itemId, slotId);
  }

  selectContentSlot(itemId: string, slotId: string, courseId: string, unitId: string): void {
    this.programs.setSelectedContentSlot(itemId, slotId, courseId, unitId);
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
    const sourceItemId = this.draggedItemId() ?? event.dataTransfer?.getData('text/plain') ?? null;
    if (sourceItemId) this.programs.moveSelectedItemTo(sourceItemId, targetItemId);
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
    const key = this.draggedContentSlotKey() ?? event.dataTransfer?.getData('text/plain') ?? '';
    const [sourceItemId, sourceSlotId] = key.split(':');
    if (sourceItemId === itemId && sourceSlotId) {
      this.programs.moveSelectedContentSlotTo(itemId, sourceSlotId, targetSlotId);
    }
    this.draggedContentSlotKey.set(null);
  }

  contentDragEnd(event: DragEvent): void {
    event.stopPropagation();
    this.draggedContentSlotKey.set(null);
  }

  back(): void {
    void this.router.navigateByUrl('/packages');
  }

  start(): void {
    this.programs.startProgram();
    void this.router.navigateByUrl('/week');
  }
}
