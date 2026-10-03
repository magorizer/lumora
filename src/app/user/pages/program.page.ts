import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { UserFlowService } from '../services/user-flow.service';
import { UserFlowUiService } from '../services/user-flow-ui.service';

@Component({
  selector: 'app-program',
  standalone: true,
  templateUrl: './program.page.html',
  styleUrls: ['../user-pages.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramPage implements OnInit {
  readonly flow = inject(UserFlowService);
  readonly ui = inject(UserFlowUiService);

  async ngOnInit(): Promise<void> {
    await this.flow.load();
  }
}
