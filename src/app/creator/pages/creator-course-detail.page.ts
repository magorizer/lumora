import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CreatorCatalogService } from '../services/creator-catalog.service';

@Component({
  selector: 'app-creator-course-detail',
  standalone: true,
  templateUrl: './creator-course-detail.page.html',
  styleUrls: ['../creator-pages.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatorCourseDetailPage implements OnInit {
  readonly creator = inject(CreatorCatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  async ngOnInit(): Promise<void> {
    await this.creator.load();

    const id = this.route.snapshot.paramMap.get('id');
    if (!id || !this.creator.courseById(id)) {
      void this.router.navigateByUrl('/creator/courses');
      return;
    }

    this.creator.selectCourse(id);
  }

  back(): void {
    void this.router.navigateByUrl('/creator/courses');
  }
}
