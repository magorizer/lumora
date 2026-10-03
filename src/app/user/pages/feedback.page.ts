import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ProgramTemplateService } from '../../core/data/program-template.service';
import { UserFlowService } from '../services/user-flow.service';
import { UserFlowUiService } from '../services/user-flow-ui.service';

@Component({
  selector: 'app-feedback',
  standalone: true,
  templateUrl: './feedback.page.html',
  styleUrls: ['../user-pages.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackPage implements OnInit {
  readonly flow = inject(UserFlowService);
  readonly ui = inject(UserFlowUiService);
  readonly programs = inject(ProgramTemplateService);
  private readonly router = inject(Router);

  async ngOnInit(): Promise<void> {
    await Promise.all([this.flow.load(), this.programs.load()]);
  }

  back(): void {
    void this.router.navigateByUrl('/week');
  }

  submit(): void {
    const current = this.programs.currentPosition();

    this.flow.patch({
      rating: 0,
      difficulty: '',
      change: '',
      lessonReflection: '',
      completedLesson: false,
      taskResponse: '',
    });

    if (current >= 12) {
      void this.router.navigateByUrl('/review');
      return;
    }

    this.programs.setCurrentPosition(current + 1);
    void this.router.navigateByUrl('/week');
  }
}
