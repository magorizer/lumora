import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ProgramSequence } from '../core/models/content.models';
import { PresenterDirectoryService, PresenterSummary } from './presenter-directory.service';

@Component({
  selector: 'app-presenter-detail',
  standalone: true,
  templateUrl: './presenter-detail.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PresenterDetailPage implements OnInit {
  readonly directory = inject(PresenterDirectoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly presenter = signal<PresenterSummary | null>(null);
  readonly preview = signal<ProgramSequence | null>(null);

  async ngOnInit(): Promise<void> {
    await this.directory.load();
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    const presenter = this.directory.presenter(slug);

    if (!presenter) {
      void this.router.navigateByUrl('/presenters');
      return;
    }

    this.presenter.set(presenter);
  }

  back(): void {
    void this.router.navigateByUrl('/presenters');
  }
}
