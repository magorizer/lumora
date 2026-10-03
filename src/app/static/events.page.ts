import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-events',
  standalone: true,
  templateUrl: './events.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsPage {}
