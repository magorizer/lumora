import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, checkmarkOutline, closeOutline } from 'ionicons/icons';
import { forkJoin } from 'rxjs';

import { LifeArea } from '../lumora/lumora.models';
import { LumoraService } from '../services/lumora.service';

interface GoalDraft {
  title: string;
  why: string;
  lifeAreaId: number | null;
}

@Component({
  selector: 'app-onboarding',
  templateUrl: 'onboarding.page.html',
  styleUrls: ['onboarding.page.scss'],
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonChip,
    IonIcon,
    IonInput,
    IonTextarea,
    IonItem,
    IonLabel,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonSpinner,
  ],
})
export class OnboardingPage implements OnInit {
  private readonly lumora = inject(LumoraService);
  private readonly router = inject(Router);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly lifeAreas = signal<LifeArea[]>([]);
  protected readonly selectedAreaIds = signal<number[]>([]);
  protected readonly error = signal<string | null>(null);
  protected reflectionStyle: 'gentle' | 'balanced' | 'direct' = 'balanced';
  protected goalDrafts: GoalDraft[] = [{ title: '', why: '', lifeAreaId: null }];

  constructor() {
    addIcons({ addOutline, checkmarkOutline, closeOutline });
  }

  ngOnInit(): void {
    forkJoin({ areas: this.lumora.getLifeAreas(), state: this.lumora.getOnboarding() }).subscribe({
      next: ({ areas, state }) => {
        this.lifeAreas.set(areas);
        this.selectedAreaIds.set(state.life_area_ids ?? []);
        this.reflectionStyle = state.reflection_style ?? 'balanced';
        if (state.completed) {
          void this.router.navigateByUrl('/app/today');
        }
      },
      error: () => this.error.set('Lumora could not prepare your setup.'),
      complete: () => this.loading.set(false),
    });
  }

  protected isAreaSelected(id: number): boolean {
    return this.selectedAreaIds().includes(id);
  }

  protected toggleArea(id: number): void {
    const current = this.selectedAreaIds();
    this.selectedAreaIds.set(current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  protected addGoal(): void {
    if (this.goalDrafts.length < 3) {
      this.goalDrafts.push({ title: '', why: '', lifeAreaId: null });
    }
  }

  protected removeGoal(index: number): void {
    if (this.goalDrafts.length > 1) {
      this.goalDrafts.splice(index, 1);
    }
  }

  protected save(): void {
    const goals = this.goalDrafts
      .map((goal) => ({ title: goal.title.trim(), why: goal.why.trim(), life_area_id: goal.lifeAreaId }))
      .filter((goal) => goal.title.length > 0);

    if (this.selectedAreaIds().length === 0) {
      this.error.set('Choose at least one life area.');
      return;
    }
    if (goals.length === 0) {
      this.error.set('Add at least one goal that matters right now.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.lumora.completeOnboarding({
      life_area_ids: this.selectedAreaIds(),
      reflection_style: this.reflectionStyle,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      goals,
    }).subscribe({
      next: () => void this.router.navigateByUrl('/app/today'),
      error: (error) => this.error.set(error?.error?.message ?? 'Could not save your setup.'),
      complete: () => this.saving.set(false),
    });
  }
}
