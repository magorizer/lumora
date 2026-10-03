import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { ProgramTemplateService } from '../../core/data/program-template.service';
import { UserFlowUiService } from '../services/user-flow-ui.service';

@Component({
  selector: 'app-current-week',
  standalone: true,
  templateUrl: './current-week.page.html',
  styleUrls: ['../user-pages.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentWeekPage implements OnInit {
  readonly programs = inject(ProgramTemplateService);
  readonly ui = inject(UserFlowUiService);

  async ngOnInit(): Promise<void> {
    await this.programs.load();
  }
}
