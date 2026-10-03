import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CreatorCatalogService } from '../services/creator-catalog.service';

@Component({
  selector: 'app-creator-course-new',
  standalone: true,
  templateUrl: './creator-course-new.page.html',
  styleUrls: ['../creator-pages.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatorCourseNewPage implements OnInit {
  readonly creator = inject(CreatorCatalogService);
  private readonly router = inject(Router);
  async ngOnInit(): Promise<void> { await this.creator.load(); }
  go(url: string): void { void this.router.navigateByUrl(url); }
  async create(): Promise<void> { const course = await this.creator.createCourse(); if (course) void this.router.navigate(['/creator/courses', course.id]); }

}
