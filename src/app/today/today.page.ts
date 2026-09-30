import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonProgressBar,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, checkmarkCircleOutline, leafOutline, refreshOutline } from 'ionicons/icons';

import { Dashboard } from '../lumora/lumora.models';
import { LumoraService } from '../services/lumora.service';

@Component({
  selector: 'app-today',
  templateUrl: 'today.page.html',
  styleUrls: ['today.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonProgressBar,
    IonBadge,
    IonList,
    IonItem,
    IonLabel,
    IonSkeletonText,
    RouterLink,
  ],
})
export class TodayPage implements OnInit {
  private readonly lumora = inject(LumoraService);
  private readonly router = inject(Router);

  protected readonly loading = signal(true);
  protected readonly dashboard = signal<Dashboard | null>(null);
  protected readonly error = signal<string | null>(null);

  constructor() {
    addIcons({ arrowForwardOutline, checkmarkCircleOutline, leafOutline, refreshOutline });
  }

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.lumora.getDashboard().subscribe({
      next: (dashboard) => {
        if (!dashboard.onboarding_completed) {
          void this.router.navigateByUrl('/onboarding');
          return;
        }
        this.dashboard.set(dashboard);
      },
      error: () => this.error.set('Lumora could not load your day. Try again.'),
      complete: () => this.loading.set(false),
    });
  }

  protected setWeeklyFocus(reviewId: number, goalId: number): void {
    this.lumora.updateWeeklyReview(reviewId, { focus_goal_id: goalId }).subscribe({
      next: (review) => this.dashboard.update((dashboard) => dashboard ? { ...dashboard, weekly_review: review } : dashboard),
      error: () => this.error.set('Could not save your weekly focus.'),
    });
  }

  protected moodLabel(mood: string): string {
    return mood ? mood.charAt(0).toUpperCase() + mood.slice(1) : '';
  }
}
