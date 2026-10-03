import { ChangeDetectionStrategy, Component, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { filter } from 'rxjs';

import { AuthService } from '../core/auth/auth.service';
import { PortalumiRole } from '../core/models/content.models';

interface MenuItem { label: string; path: string; icon: string; }
type ProgressMode = 'onboarding' | 'program' | 'none';

interface ProgressConfig {
  mode: ProgressMode;
  current: number;
  total: number;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [IonContent, RouterOutlet, RouterLink],
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent implements OnInit {
  @ViewChild(IonContent) private content?: IonContent;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly auth = inject(AuthService);
  readonly menuOpen = signal(false);
  readonly layout = signal<'user' | 'creator' | 'profile'>('user');
  readonly progressMode = signal<ProgressMode>('onboarding');
  readonly progressCurrent = signal(1);
  readonly progressTotal = signal(5);

  readonly progressItems = computed(() => Array.from({ length: this.progressTotal() }));
  readonly progressLabel = computed(() =>
    `${this.progressCurrent()} / ${this.progressTotal()}`,
  );
  readonly isFirstOnboarding = computed(() =>
    this.progressMode() === 'onboarding' && this.progressCurrent() === 1,
  );

  readonly userMenu: MenuItem[] = [
    { label: 'Programom', path: '/program', icon: '◇' },
    { label: 'Mai program', path: '/week', icon: '◫' },
    { label: 'Lecke', path: '/lesson', icon: '▶' },
    { label: 'Haladás / review', path: '/review', icon: '↗' },
  ];

  readonly creatorMenu: MenuItem[] = [
    { label: 'Áttekintés', path: '/creator/dashboard', icon: '◇' },
    { label: 'Kurzusaim', path: '/creator/courses', icon: '▦' },
    { label: 'Programok', path: '/creator/programs', icon: '◫' },
    { label: 'Új kurzus', path: '/creator/courses/new', icon: '+' },
    { label: 'Képzői profil', path: '/creator/profile', icon: '◎' },
  ];

  readonly menuItems = computed(() =>
    this.auth.activeRole() === 'content_creator' ? this.creatorMenu : this.userMenu,
  );

  async ngOnInit(): Promise<void> {
    await this.auth.load();
    this.syncRoute();
    this.scheduleScrollToTop();

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.syncRoute();
        this.scheduleScrollToTop();
      });
  }

  toggleMenu(): void { this.menuOpen.update((open) => !open); }
  closeMenu(): void { this.menuOpen.set(false); }

  toggleRole(): void {
    const next: PortalumiRole = this.auth.activeRole() === 'user' ? 'content_creator' : 'user';
    if (!this.auth.hasRole(next)) return;

    this.auth.setActiveRole(next);
    this.closeMenu();
    void this.router.navigateByUrl(next === 'content_creator' ? '/creator/dashboard' : '/program');
  }

  isActive(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(path + '/');
  }

  private scheduleScrollToTop(): void {
    requestAnimationFrame(() => { void this.scrollPageToTop(); });
    window.setTimeout(() => { void this.scrollPageToTop(); }, 80);
  }

  private async scrollPageToTop(): Promise<void> {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (this.content) {
      const scrollElement = await this.content.getScrollElement();
      scrollElement.scrollTop = 0;
      await this.content.scrollToPoint(0, 0, 0);
    }
  }

  private syncRoute(): void {
    let active = this.route;
    while (active.firstChild) active = active.firstChild;

    const data = active.snapshot.data;
    const fallback = this.progressFromUrl();

    this.layout.set((data['layout'] as 'user' | 'creator' | 'profile') ?? this.layoutFromUrl());
    this.progressMode.set((data['progressMode'] as ProgressMode) ?? fallback.mode);
    this.progressCurrent.set(typeof data['progressCurrent'] === 'number' ? data['progressCurrent'] as number : fallback.current);
    this.progressTotal.set(typeof data['progressTotal'] === 'number' ? data['progressTotal'] as number : fallback.total);
  }

  private layoutFromUrl(): 'user' | 'creator' | 'profile' {
    if (this.router.url.startsWith('/creator/')) return 'creator';
    if (this.router.url.startsWith('/profile')) return 'profile';
    return 'user';
  }

  private progressFromUrl(): ProgressConfig {
    const path = this.router.url.split('?')[0];

    const onboarding: Record<string, number> = {
      '/goals': 1,
      '/questionnaire/situation': 2,
      '/questionnaire/preferences': 3,
      '/profile-summary': 4,
      '/generating': 5,
    };

    if (onboarding[path]) {
      return { mode: 'onboarding', current: onboarding[path], total: 5 };
    }

    if (['/program', '/program/customize', '/program-adjustment', '/week', '/lesson', '/feedback'].includes(path)) {
      return { mode: 'program', current: 1, total: 12 };
    }

    if (['/review', '/next-cycle'].includes(path)) {
      return { mode: 'program', current: 12, total: 12 };
    }

    return { mode: 'none', current: 0, total: 0 };
  }
}
