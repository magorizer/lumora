import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CreatorCatalogService } from '../services/creator-catalog.service';

@Component({
  selector: 'app-creator-dashboard',
  standalone: true,
  templateUrl: './creator-dashboard.page.html',
  styleUrls: ['../creator-pages.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatorDashboardPage implements OnInit {
  readonly creator = inject(CreatorCatalogService);
  private readonly router = inject(Router);
  async ngOnInit(): Promise<void> { await this.creator.load(); }
  go(url: string): void { void this.router.navigateByUrl(url); }
  openCourse(id: string): void { this.creator.selectCourse(id); void this.router.navigate(['/creator/courses', id]); }

}
