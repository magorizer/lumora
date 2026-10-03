import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-professional-help',
  standalone: true,
  templateUrl: './professional-help.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalHelpPage {}
