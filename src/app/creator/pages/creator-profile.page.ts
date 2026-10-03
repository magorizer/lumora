import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CreatorCatalogService } from '../services/creator-catalog.service';

@Component({
  selector: 'app-creator-profile',
  standalone: true,
  templateUrl: './creator-profile.page.html',
  styleUrls: ['../creator-pages.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatorProfilePage implements OnInit {
  readonly creator = inject(CreatorCatalogService);
  async ngOnInit(): Promise<void> { await this.creator.load(); }
}
