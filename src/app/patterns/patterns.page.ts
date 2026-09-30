import { Component, OnInit, inject, signal } from '@angular/core';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonNote,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkOutline, closeOutline, refreshOutline } from 'ionicons/icons';

import { PatternItem } from '../lumora/lumora.models';
import { LumoraService } from '../services/lumora.service';

@Component({
  selector: 'app-patterns',
  templateUrl: 'patterns.page.html',
  styleUrls: ['patterns.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonBadge,
    IonButton,
    IonIcon,
    IonNote,
    IonSkeletonText,
  ],
})
export class PatternsPage implements OnInit {
  private readonly lumora = inject(LumoraService);

  protected readonly loading = signal(true);
  protected readonly patterns = signal<PatternItem[]>([]);
  protected readonly error = signal<string | null>(null);

  constructor() {
    addIcons({ checkmarkOutline, closeOutline, refreshOutline });
  }

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.lumora.getPatterns().subscribe({
      next: (patterns) => this.patterns.set(patterns),
      error: () => this.error.set('Could not calculate your patterns right now.'),
      complete: () => this.loading.set(false),
    });
  }

  protected updateStatus(pattern: PatternItem, status: PatternItem['status']): void {
    this.lumora.setPatternStatus(pattern.id, status).subscribe({
      next: (updated) => {
        if (status === 'dismissed') {
          this.patterns.update((items) => items.filter((item) => item.id !== pattern.id));
          return;
        }
        this.patterns.update((items) => items.map((item) => item.id === updated.id ? updated : item));
      },
      error: () => this.error.set('Could not save that feedback.'),
    });
  }
}
