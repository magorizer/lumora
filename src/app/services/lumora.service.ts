import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import {
  ActionItem,
  Checkin,
  Dashboard,
  Goal,
  LifeArea,
  MemoryItem,
  OnboardingState,
  PatternItem,
  WeeklyReview,
} from '../lumora/lumora.models';

@Injectable({ providedIn: 'root' })
export class LumoraService {
  private readonly http = inject(HttpClient);

  getLifeAreas() {
    return this.http.get<LifeArea[]>('api/life-areas');
  }

  getOnboarding() {
    return this.http.get<OnboardingState>('api/onboarding');
  }

  completeOnboarding(payload: {
    life_area_ids: number[];
    reflection_style: 'gentle' | 'balanced' | 'direct';
    timezone?: string;
    goals: Array<{ title: string; why?: string; life_area_id?: number | null }>;
  }) {
    return this.http.post<OnboardingState>('api/onboarding', payload);
  }

  getDashboard() {
    return this.http.get<Dashboard>('api/dashboard');
  }

  getCheckins(limit = 30) {
    return this.http.get<Checkin[]>(`api/checkins?limit=${limit}`);
  }

  saveCheckin(payload: {
    checkin_date: string;
    mood: string;
    energy: number;
    energizers: string[];
    drainers: string[];
    note?: string;
    life_area_ids: number[];
    goal_ids: number[];
  }) {
    return this.http.post<Checkin>('api/checkins', payload);
  }


  deleteCheckin(id: number) {
    return this.http.delete<void>(`api/checkins/${id}`);
  }

  getGoals(activeOnly = false) {
    return this.http.get<Goal[]>(`api/goals${activeOnly ? '?active_only=1' : ''}`);
  }

  createGoal(payload: { title: string; why?: string; life_area_id?: number | null; target_date?: string | null }) {
    return this.http.post<Goal>('api/goals', payload);
  }

  updateGoal(id: number, payload: Partial<Pick<Goal, 'title' | 'why' | 'progress' | 'status' | 'target_date'>>) {
    return this.http.put<Goal>(`api/goals/${id}`, payload);
  }

  getActions(status?: 'open' | 'completed') {
    return this.http.get<ActionItem[]>(`api/actions${status ? `?status=${status}` : ''}`);
  }

  createAction(payload: { title: string; goal_id?: number | null; due_date?: string | null }) {
    return this.http.post<ActionItem>('api/actions', payload);
  }

  updateAction(id: number, payload: Partial<Pick<ActionItem, 'title' | 'status' | 'due_date'>>) {
    return this.http.put<ActionItem>(`api/actions/${id}`, payload);
  }

  getMemories() {
    return this.http.get<MemoryItem[]>('api/memories');
  }

  createMemory(payload: { category: MemoryItem['category']; title?: string; content: string; is_pinned?: boolean }) {
    return this.http.post<MemoryItem>('api/memories', payload);
  }

  updateMemory(id: number, payload: Partial<MemoryItem>) {
    return this.http.put<MemoryItem>(`api/memories/${id}`, payload);
  }

  deleteMemory(id: number) {
    return this.http.delete<void>(`api/memories/${id}`);
  }

  getPatterns(includeDismissed = false) {
    return this.http.get<PatternItem[]>(`api/patterns${includeDismissed ? '?include_dismissed=1' : ''}`);
  }

  setPatternStatus(id: number, status: PatternItem['status']) {
    return this.http.put<PatternItem>(`api/patterns/${id}/feedback`, { status });
  }

  getWeeklyReview() {
    return this.http.get<WeeklyReview>('api/weekly-reviews/current');
  }

  getWeeklyReviews() {
    return this.http.get<WeeklyReview[]>('api/weekly-reviews');
  }

  updateWeeklyReview(id: number, payload: { focus_life_area_id?: number | null; focus_goal_id?: number | null; focus_note?: string | null }) {
    return this.http.put<WeeklyReview>(`api/weekly-reviews/${id}`, payload);
  }
}
