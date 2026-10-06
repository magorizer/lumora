import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { ProgramTemplateService } from '../../core/data/program-template.service';
import { ProgramDay } from '../../core/models/content.models';
import { UserFlowService } from '../services/user-flow.service';
import { UserFlowUiService } from '../services/user-flow-ui.service';

interface DayOption {
  id: ProgramDay;
  short: string;
  label: string;
}

@Component({
  selector: 'app-questionnaire-preferences',
  standalone: true,
  templateUrl: './questionnaire-preferences.page.html',
  styleUrls: ['../user-pages.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionnairePreferencesPage implements OnInit {
  readonly flow = inject(UserFlowService);
  readonly ui = inject(UserFlowUiService);
  readonly programs = inject(ProgramTemplateService);

  readonly days: DayOption[] = [
    { id: 'monday', short: 'H', label: 'Hétfő' },
    { id: 'tuesday', short: 'K', label: 'Kedd' },
    { id: 'wednesday', short: 'Sze', label: 'Szerda' },
    { id: 'thursday', short: 'Cs', label: 'Csütörtök' },
    { id: 'friday', short: 'P', label: 'Péntek' },
    { id: 'saturday', short: 'Szo', label: 'Szombat' },
    { id: 'sunday', short: 'V', label: 'Vasárnap' },
  ];

  private readonly recommendedDayCounts: Record<string, number> = {
    '15–30 perc': 2,
    '1 óra': 3,
    '2–3 óra': 5,
    'rugalmas': 7,
  };

  async ngOnInit(): Promise<void> {
    await Promise.all([this.flow.load(), this.programs.load()]);
  }

  selectWeeklyTime(value: string): void {
    this.flow.patch({ weeklyTime: value });
    this.syncRecommendedDays(this.recommendedDayCounts[value] ?? 3);
  }

  recommendedDayCount(): number {
    return this.recommendedDayCounts[this.flow.answers().weeklyTime] ?? this.programs.selectedDays().length;
  }

  private syncRecommendedDays(targetCount: number): void {
    const orderedSelected = this.days
      .filter((day) => this.programs.isDaySelected(day.id))
      .map((day) => day.id);

    if (orderedSelected.length > targetCount) {
      for (const day of orderedSelected.slice(targetCount)) {
        this.programs.toggleDay(day);
      }
      return;
    }

    if (orderedSelected.length < targetCount) {
      const missing = this.days
        .filter((day) => !this.programs.isDaySelected(day.id))
        .slice(0, targetCount - orderedSelected.length);

      for (const day of missing) {
        this.programs.toggleDay(day.id);
      }
    }
  }
}
