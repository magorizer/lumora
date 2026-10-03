import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';

import { ProgramTemplateService } from '../core/data/program-template.service';
import { ProgramSequence } from '../core/models/content.models';

@Component({
  selector: 'app-programs',
  standalone: true,
  templateUrl: './programs.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramsPage implements OnInit {
  readonly programs = inject(ProgramTemplateService);
  readonly preview = signal<ProgramSequence | null>(null);

  async ngOnInit(): Promise<void> {
    await this.programs.load();
  }
}
