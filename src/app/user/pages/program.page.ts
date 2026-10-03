import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ProgramTemplateService } from '../../core/data/program-template.service';

@Component({
  selector: 'app-program',
  standalone: true,
  templateUrl: './program.page.html',
  styleUrls: ['../user-pages.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramPage implements OnInit {
  readonly programs = inject(ProgramTemplateService);
  private readonly router = inject(Router);

  async ngOnInit(): Promise<void> {
    await this.programs.load();
  }

  choose(id: string): void {
    this.programs.selectTemplate(id);
    void this.router.navigateByUrl('/program/customize');
  }
}
