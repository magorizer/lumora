import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../core/auth/auth.service';
import { PortalumiRole } from '../core/models/content.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage implements OnInit {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  async ngOnInit(): Promise<void> { await this.auth.load(); }
  switchRole(role: PortalumiRole): void {
    this.auth.setActiveRole(role);
    void this.router.navigateByUrl(role === 'content_creator' ? '/creator/dashboard' : '/program');
  }
}
