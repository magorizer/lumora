import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { UserFlowService } from '../services/user-flow.service';
import { UserFlowUiService } from '../services/user-flow-ui.service';

@Component({
  selector: 'app-questionnaire-situation',
  standalone: true,
  templateUrl: './questionnaire-situation.page.html',
  styleUrls: ['../user-pages.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionnaireSituationPage implements OnInit {
  readonly flow = inject(UserFlowService);
  readonly ui = inject(UserFlowUiService);

  async ngOnInit(): Promise<void> {
    await this.flow.load();
  }

  setMeditatedBefore(value: 'yes' | 'no'): void {
    this.flow.patch({
      meditatedBefore: value,
      meditationExperience: value === 'no' ? '' : this.flow.answers().meditationExperience,
    });
  }
}
