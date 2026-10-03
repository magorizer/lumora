import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ProgramTemplateService } from '../../core/data/program-template.service';
import { ProgramDay } from '../../core/models/content.models';

interface DayOption {
  id: ProgramDay;
  short: string;
  label: string;
}

@Component({
  selector: 'app-program-customize',
  standalone: true,
  templateUrl: './program-customize.page.html',
  styleUrls: ['../user-pages.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramCustomizePage implements OnInit {
  readonly programs = inject(ProgramTemplateService);
  private readonly router = inject(Router);

  readonly days: DayOption[] = [
    { id: 'monday', short: 'H', label: 'Hétfő' },
    { id: 'tuesday', short: 'K', label: 'Kedd' },
    { id: 'wednesday', short: 'Sze', label: 'Szerda' },
    { id: 'thursday', short: 'Cs', label: 'Csütörtök' },
    { id: 'friday', short: 'P', label: 'Péntek' },
    { id: 'saturday', short: 'Szo', label: 'Szombat' },
    { id: 'sunday', short: 'V', label: 'Vasárnap' },
  ];

  async ngOnInit(): Promise<void> {
    await this.programs.load();
  }

  changeMorning(event: Event): void {
    this.programs.setTrack('morning', (event.target as HTMLSelectElement).value);
  }

  changeEvening(event: Event): void {
    this.programs.setTrack('evening', (event.target as HTMLSelectElement).value);
  }

  back(): void {
    void this.router.navigateByUrl('/program');
  }

  start(): void {
    this.programs.startProgram();
    void this.router.navigateByUrl('/week');
  }
}
