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

  useFullCourse(itemId: string, courseId: string): void {
    this.programs.setSelectedItemCourse(itemId, courseId);
  }

  selectUnit(itemId: string, courseId: string, unitId: string): void {
    this.programs.setSelectedItemUnit(itemId, courseId, unitId);
  }

  setSearch(itemId: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQueries.update((queries) => ({ ...queries, [itemId]: value }));
  }

  searchQuery(itemId: string): string {
    return this.searchQueries()[itemId] ?? '';
  }

  searchResults(template: ProgramTemplate, itemId: string): ProgramContentOption[] {
    const query = this.searchQuery(itemId);
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

  back(): void {
    void this.router.navigateByUrl('/packages');
  }

  start(): void {
    this.programs.startProgram();
    void this.router.navigateByUrl('/week');
  }
}
