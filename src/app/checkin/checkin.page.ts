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
  IonLabel,
  IonNote,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkOutline } from 'ionicons/icons';
import { forkJoin } from 'rxjs';

import { Goal, LifeArea } from '../lumora/lumora.models';
import { LumoraService } from '../services/lumora.service';

@Component({
  selector: 'app-checkin',
  templateUrl: 'checkin.page.html',
  styleUrls: ['checkin.page.scss'],
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonChip,
    IonIcon,
    IonLabel,
    IonInput,
    IonTextarea,
    IonNote,
    IonSpinner,
  ],
})
export class CheckinPage implements OnInit {
  private readonly lumora = inject(LumoraService);
  private readonly router = inject(Router);

  protected readonly lifeAreas = signal<LifeArea[]>([]);
  protected readonly goals = signal<Goal[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected mood = '';
  protected energy = 3;
  protected selectedAreaIds: number[] = [];
  protected selectedGoalIds: number[] = [];
  protected energizersText = '';
  protected drainersText = '';
  protected note = '';

  protected readonly moods = [
    { value: 'calm', label: 'Calm', symbol: '◌' },
    { value: 'tense', label: 'Tense', symbol: '⌁' },
    { value: 'tired', label: 'Tired', symbol: '☾' },
    { value: 'energized', label: 'Energized', symbol: '↟' },
    { value: 'scattered', label: 'Scattered', symbol: '⋯' },
    { value: 'hopeful', label: 'Hopeful', symbol: '✦' },
    { value: 'low', label: 'Low', symbol: '↓' },
    { value: 'content', label: 'Content', symbol: '◇' },
  ];

  constructor() {
    addIcons({ checkmarkOutline });
  }

  ngOnInit(): void {
    forkJoin({ areas: this.lumora.getLifeAreas(), goals: this.lumora.getGoals(true), checkins: this.lumora.getCheckins(1) }).subscribe({
      next: ({ areas, goals, checkins }) => {
        this.lifeAreas.set(areas);
        this.goals.set(goals);
        const today = this.localDate();
        const existing = checkins.find((item) => item.checkin_date === today);
        if (existing) {
          this.mood = existing.mood;
          this.energy = existing.energy;
          this.selectedAreaIds = existing.life_areas.map((area) => area.id);
          this.selectedGoalIds = existing.goals.map((goal) => goal.id);
          this.energizersText = (existing.energizers ?? []).join(', ');
          this.drainersText = (existing.drainers ?? []).join(', ');
          this.note = existing.note ?? '';
        }
      },
      error: () => this.error.set('Could not load your check-in.'),
      complete: () => this.loading.set(false),
    });
  }

  protected setMood(value: string): void {
    this.mood = value;
  }

  protected setEnergy(value: number): void {
    this.energy = value;
  }

  protected toggleArea(id: number): void {
    this.selectedAreaIds = this.selectedAreaIds.includes(id)
      ? this.selectedAreaIds.filter((value) => value !== id)
      : [...this.selectedAreaIds, id];
  }

  protected toggleGoal(id: number): void {
    this.selectedGoalIds = this.selectedGoalIds.includes(id)
      ? this.selectedGoalIds.filter((value) => value !== id)
      : [...this.selectedGoalIds, id];
  }

  protected save(): void {
    if (!this.mood) {
      this.error.set('Choose the state that is closest to how you feel right now.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.lumora.saveCheckin({
      checkin_date: this.localDate(),
      mood: this.mood,
      energy: this.energy,
      energizers: this.splitTags(this.energizersText),
      drainers: this.splitTags(this.drainersText),
      note: this.note.trim(),
      life_area_ids: this.selectedAreaIds,
      goal_ids: this.selectedGoalIds,
    }).subscribe({
      next: () => void this.router.navigateByUrl('/app/today'),
      error: (error) => this.error.set(error?.error?.message ?? 'Could not save your check-in.'),
      complete: () => this.saving.set(false),
    });
  }

  private splitTags(value: string): string[] {
    return value.split(',').map((item) => item.trim()).filter(Boolean).slice(0, 8);
  }

  private localDate(): string {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
  }
}
