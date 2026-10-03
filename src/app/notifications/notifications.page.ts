import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';

interface DemoNotification {
  id: string;
  text: string;
}

interface NotificationSettings {
  startHour: number;
  endHour: number;
  notifications: DemoNotification[];
}

const DEFAULT_SETTINGS: NotificationSettings = {
  startHour: 9,
  endHour: 21,
  notifications: [
    { id: 'demo-1', text: 'Zseniális vagyok.' },
    { id: 'demo-2', text: 'Ha van időd, állj meg egy fél percre, és figyelj befelé.' },
    { id: 'demo-3', text: 'Mosolyogj, és figyeld meg, mi történik a testedben.' },
  ],
};

@Component({
  selector: 'app-notifications',
  standalone: true,
  templateUrl: './notifications.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsPage implements OnInit {
  private readonly storageKey = 'portalumi-demo-notification-settings';

  readonly startHour = signal(9);
  readonly endHour = signal(21);
  readonly notifications = signal<DemoNotification[]>([]);

  ngOnInit(): void {
    this.restore();
  }

  setHour(which: 'start' | 'end', event: Event): void {
    const input = event.target as HTMLInputElement;
    const parsed = Number.parseInt(input.value, 10);
    const value = Number.isFinite(parsed) ? Math.min(23, Math.max(0, parsed)) : 0;

    if (which === 'start') this.startHour.set(value);
    if (which === 'end') this.endHour.set(value);

    this.persist();
  }

  updateNotification(id: string, event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.notifications.update((items) =>
      items.map((item) => item.id === id ? { ...item, text: value } : item),
    );
    this.persist();
  }

  removeNotification(id: string): void {
    this.notifications.update((items) => items.filter((item) => item.id !== id));
    this.persist();
  }

  private restore(): void {
    const raw = localStorage.getItem(this.storageKey);

    if (!raw) {
      this.apply(DEFAULT_SETTINGS);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<NotificationSettings>;
      this.apply({
        startHour: typeof parsed.startHour === 'number' ? parsed.startHour : DEFAULT_SETTINGS.startHour,
        endHour: typeof parsed.endHour === 'number' ? parsed.endHour : DEFAULT_SETTINGS.endHour,
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : DEFAULT_SETTINGS.notifications,
      });
    } catch {
      this.apply(DEFAULT_SETTINGS);
    }
  }

  private apply(settings: NotificationSettings): void {
    this.startHour.set(settings.startHour);
    this.endHour.set(settings.endHour);
    this.notifications.set(settings.notifications.map((item) => ({ ...item })));
  }

  private persist(): void {
    const settings: NotificationSettings = {
      startHour: this.startHour(),
      endHour: this.endHour(),
      notifications: this.notifications(),
    };

    localStorage.setItem(this.storageKey, JSON.stringify(settings));
  }
}
