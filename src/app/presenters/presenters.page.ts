import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { PresenterDirectoryService } from './presenter-directory.service';

@Component({
  selector: 'app-presenters',
  standalone: true,
  templateUrl: './presenters.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PresentersPage implements OnInit {
  readonly directory = inject(PresenterDirectoryService);
  private readonly router = inject(Router);

  async ngOnInit(): Promise<void> {
    await this.directory.load();
  }

  open(slug: string): void {
    void this.router.navigate(['/presenters', slug]);
  }
}
