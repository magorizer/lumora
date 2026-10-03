import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ProgramTemplateService } from '../core/data/program-template.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit {
  readonly programs = inject(ProgramTemplateService);
  private readonly router = inject(Router);

  async ngOnInit(): Promise<void> {
    await this.programs.load();
  }

  openMyProgram(): void {
    if (this.programs.started()) {
      void this.router.navigateByUrl('/week');
      return;
    }

    if (this.programs.selectedTemplate()) {
      void this.router.navigateByUrl('/program/customize');
      return;
    }

    void this.router.navigateByUrl('/goals');
  }

  go(path: string): void {
    void this.router.navigateByUrl(path);
  }
}
