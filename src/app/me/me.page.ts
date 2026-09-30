import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { ClerkService, ClerkSignOutButtonDirective } from 'ngx-clerk';
import { addIcons } from 'ionicons';
import { addOutline, pinOutline, trashOutline } from 'ionicons/icons';
import { forkJoin } from 'rxjs';

import { Checkin, MemoryItem, WeeklyReview } from '../lumora/lumora.models';
import { LumoraService } from '../services/lumora.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-me',
  templateUrl: 'me.page.html',
  styleUrls: ['me.page.scss'],
  imports: [
    FormsModule,
    ClerkSignOutButtonDirective,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonChip,
    IonIcon,
    IonInput,
    IonTextarea,
    IonItem,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonSpinner,
  ],
})
export class MePage implements OnInit {
  private readonly lumora = inject(LumoraService);
  protected readonly userService = inject(UserService);
  protected readonly clerk = inject(ClerkService);

  protected readonly loading = signal(true);
  protected readonly memories = signal<MemoryItem[]>([]);
  protected readonly checkins = signal<Checkin[]>([]);
  protected readonly reviews = signal<WeeklyReview[]>([]);
  protected readonly error = signal<string | null>(null);

  protected newMemoryCategory: MemoryItem['category'] = 'insight';
  protected newMemoryTitle = '';
  protected newMemoryContent = '';
  protected showMemoryEditor = false;
  protected editingMemoryId: number | null = null;
  protected editMemoryTitle = '';
  protected editMemoryContent = '';

  constructor() {
    addIcons({ addOutline, pinOutline, trashOutline });
  }

  ngOnInit(): void {
    if (!this.userService.user()) {
      this.userService.getProfile().subscribe();
    }
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      memories: this.lumora.getMemories(),
      checkins: this.lumora.getCheckins(30),
      reviews: this.lumora.getWeeklyReviews(),
    }).subscribe({
      next: ({ memories, checkins, reviews }) => {
        this.memories.set(memories);
        this.checkins.set(checkins);
        this.reviews.set(reviews);
      },
      error: () => this.error.set('Could not load your Lumora profile.'),
      complete: () => this.loading.set(false),
    });
  }

  protected addMemory(): void {
    const content = this.newMemoryContent.trim();
    if (!content) {
      this.error.set('Write what you want Lumora to remember.');
      return;
    }

    this.lumora.createMemory({
      category: this.newMemoryCategory,
      title: this.newMemoryTitle.trim(),
      content,
    }).subscribe({
      next: (memory) => {
        this.memories.update((items) => [memory, ...items]);
        this.newMemoryTitle = '';
        this.newMemoryContent = '';
        this.showMemoryEditor = false;
      },
      error: () => this.error.set('Could not save that memory.'),
    });
  }

  protected startEditMemory(memory: MemoryItem): void {
    this.editingMemoryId = memory.id;
    this.editMemoryTitle = memory.title ?? '';
    this.editMemoryContent = memory.content;
  }

  protected saveMemoryEdit(memory: MemoryItem): void {
    const content = this.editMemoryContent.trim();
    if (!content) {
      this.error.set('Memory content cannot be empty.');
      return;
    }

    this.lumora.updateMemory(memory.id, {
      title: this.editMemoryTitle.trim(),
      content,
    }).subscribe({
      next: (updated) => {
        this.memories.update((items) => items.map((item) => item.id === updated.id ? updated : item));
        this.editingMemoryId = null;
      },
      error: () => this.error.set('Could not edit that memory.'),
    });
  }

  protected togglePin(memory: MemoryItem): void {
    this.lumora.updateMemory(memory.id, { is_pinned: !memory.is_pinned }).subscribe({
      next: (updated) => this.memories.update((items) => items
        .map((item) => item.id === updated.id ? updated : item)
        .sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned))),
      error: () => this.error.set('Could not update that memory.'),
    });
  }

  protected deleteMemory(memory: MemoryItem): void {
    this.lumora.deleteMemory(memory.id).subscribe({
      next: () => this.memories.update((items) => items.filter((item) => item.id !== memory.id)),
      error: () => this.error.set('Could not delete that memory.'),
    });
  }

  protected deleteCheckin(checkin: Checkin): void {
    this.lumora.deleteCheckin(checkin.id).subscribe({
      next: () => this.checkins.update((items) => items.filter((item) => item.id !== checkin.id)),
      error: () => this.error.set('Could not delete that check-in.'),
    });
  }


  protected initial(): string {
    const user = this.userService.user();
    const value = user?.firstName || user?.name || this.clerk.user()?.firstName || 'L';
    return value.charAt(0).toUpperCase();
  }

  protected moodLabel(value: string): string {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
  }

  protected entries(value: Record<string, number>): Array<[string, number]> {
    return Object.entries(value ?? {}).slice(0, 3);
  }
}
