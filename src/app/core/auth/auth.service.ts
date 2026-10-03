import { Injectable, computed, inject, signal } from '@angular/core';

import { UserRepository } from '../data/repositories';
import { PortalumiRole, PortalumiUser } from '../models/content.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly repository = inject(UserRepository);
  readonly user = signal<PortalumiUser | null>(null);
  readonly loaded = signal(false);
  readonly activeRole = computed<PortalumiRole>(() => this.user()?.activeRole ?? 'user');

  async load(): Promise<void> {
    if (this.loaded()) return;
    const users = await this.repository.loadUsers();
    const base = users[0] ?? {
      id: 'demo-user',
      name: 'Demo felhasználó',
      email: 'demo@portalumi.local',
      roles: ['user'] as PortalumiRole[],
      activeRole: 'user' as PortalumiRole,
    };
    const stored = sessionStorage.getItem('portalumi-active-role') as PortalumiRole | null;
    const activeRole = stored && base.roles.includes(stored) ? stored : base.activeRole;
    this.user.set({ ...base, activeRole });
    this.loaded.set(true);
  }

  hasRole(role: PortalumiRole): boolean {
    return this.user()?.roles.includes(role) ?? false;
  }

  setActiveRole(role: PortalumiRole): void {
    const current = this.user();
    if (!current?.roles.includes(role)) return;
    this.user.set({ ...current, activeRole: role });
    sessionStorage.setItem('portalumi-active-role', role);
  }
}
