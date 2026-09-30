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
  IonLabel,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, archiveOutline, checkmarkCircleOutline, ellipseOutline } from 'ionicons/icons';
import { forkJoin } from 'rxjs';

import { ActionItem, Goal, LifeArea } from '../lumora/lumora.models';
import { LumoraService } from '../services/lumora.service';

@Component({
  selector: 'app-goals',
  templateUrl: 'goals.page.html',
  styleUrls: ['goals.page.scss'],
  imports: [
    FormsModule,
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
    IonItem,
    IonLabel,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonSpinner,
  ],
})
export class GoalsPage implements OnInit {
  private readonly lumora = inject(LumoraService);

  protected readonly loading = signal(true);
  protected readonly goals = signal<Goal[]>([]);
  protected readonly lifeAreas = signal<LifeArea[]>([]);
  protected readonly actions = signal<ActionItem[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly saving = signal(false);

  protected showNewGoal = false;
  protected newGoalTitle = '';
  protected newGoalWhy = '';
  protected newGoalAreaId: number | null = null;
  protected actionDrafts: Record<number, string> = {};
  protected editingGoalId: number | null = null;
  protected editGoalTitle = '';
  protected editGoalWhy = '';

  constructor() {
    addIcons({ addOutline, archiveOutline, checkmarkCircleOutline, ellipseOutline });
  }

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    forkJoin({
      goals: this.lumora.getGoals(),
      areas: this.lumora.getLifeAreas(),
      actions: this.lumora.getActions(),
    }).subscribe({
      next: ({ goals, areas, actions }) => {
        this.goals.set(goals);
        this.lifeAreas.set(areas);
        this.actions.set(actions);
      },
      error: () => this.error.set('Could not load your goals.'),
      complete: () => this.loading.set(false),
    });
  }

  protected activeGoals(): Goal[] {
    return this.goals().filter((goal) => goal.status === 'active');
  }

  protected completedGoals(): Goal[] {
    return this.goals().filter((goal) => goal.status !== 'active');
  }

  protected goalActions(goalId: number): ActionItem[] {
    return this.actions().filter((action) => action.goal?.id === goalId);
  }

  protected createGoal(): void {
    if (!this.newGoalTitle.trim()) {
      this.error.set('Give the goal a short title.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.lumora.createGoal({
      title: this.newGoalTitle.trim(),
      why: this.newGoalWhy.trim(),
      life_area_id: this.newGoalAreaId,
    }).subscribe({
      next: (goal) => {
        this.goals.update((items) => [goal, ...items]);
        this.newGoalTitle = '';
        this.newGoalWhy = '';
        this.newGoalAreaId = null;
        this.showNewGoal = false;
      },
      error: (error) => this.error.set(error?.error?.message ?? 'Could not create that goal.'),
      complete: () => this.saving.set(false),
    });
  }

  protected startGoalEdit(goal: Goal): void {
    this.editingGoalId = goal.id;
    this.editGoalTitle = goal.title;
    this.editGoalWhy = goal.why ?? '';
  }

  protected saveGoalEdit(goal: Goal): void {
    const title = this.editGoalTitle.trim();
    if (!title) {
      this.error.set('Goal title cannot be empty.');
      return;
    }
    this.lumora.updateGoal(goal.id, { title, why: this.editGoalWhy.trim() }).subscribe({
      next: (updated) => {
        this.goals.update((items) => items.map((item) => item.id === updated.id ? updated : item));
        this.editingGoalId = null;
      },
      error: () => this.error.set('Could not edit that goal.'),
    });
  }

  protected updateProgress(goal: Goal, progress: number): void {
    this.lumora.updateGoal(goal.id, { progress }).subscribe({
      next: (updated) => this.goals.update((items) => items.map((item) => item.id === updated.id ? updated : item)),
      error: () => this.error.set('Could not update progress.'),
    });
  }

  protected archiveGoal(goal: Goal): void {
    this.lumora.updateGoal(goal.id, { status: 'archived' }).subscribe({
      next: (updated) => this.goals.update((items) => items.map((item) => item.id === updated.id ? updated : item)),
      error: () => this.error.set('Could not archive that goal.'),
    });
  }

  protected addAction(goal: Goal): void {
    const title = (this.actionDrafts[goal.id] ?? '').trim();
    if (!title) return;
    this.lumora.createAction({ title, goal_id: goal.id }).subscribe({
      next: (action) => {
        this.actions.update((items) => [action, ...items]);
        this.actionDrafts[goal.id] = '';
      },
      error: () => this.error.set('Could not add that next step.'),
    });
  }

  protected toggleAction(action: ActionItem): void {
    const status = action.status === 'completed' ? 'open' : 'completed';
    this.lumora.updateAction(action.id, { status }).subscribe({
      next: (updated) => this.actions.update((items) => items.map((item) => item.id === updated.id ? updated : item)),
      error: () => this.error.set('Could not update that action.'),
    });
  }
}
