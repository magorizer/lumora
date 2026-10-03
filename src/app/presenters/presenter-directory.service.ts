import { Injectable, inject } from '@angular/core';

import { ProgramSequence } from '../core/models/content.models';
import { ProgramTemplateService } from '../core/data/program-template.service';
import { UserFlowService } from '../user/services/user-flow.service';

export interface PresenterSummary {
  name: string;
  slug: string;
  specialty: string;
  bio: string;
  sequenceCount: number;
  courseCount: number;
}

@Injectable({ providedIn: 'root' })
export class PresenterDirectoryService {
  private readonly programs = inject(ProgramTemplateService);
  private readonly flow = inject(UserFlowService);

  async load(): Promise<void> {
    await Promise.all([this.programs.load(), this.flow.load()]);
  }

  presenters(): PresenterSummary[] {
    const names = new Set<string>([
      ...this.flow.instructors().map((item) => item.name),
      ...this.programs.sequences().map((item) => item.creatorName),
    ]);

    return [...names]
      .map((name) => {
        const instructor = this.flow.instructors().find((item) => item.name === name);
        const sequenceCount = this.programs.sequences().filter((item) => item.creatorName === name).length;
        const courseCount = instructor
          ? this.flow.courses().filter((item) => item.instructorId === instructor.id).length
          : 0;

        return {
          name,
          slug: this.slugify(name),
          specialty: instructor?.specialty ?? 'Meditációs és önfejlesztő tartalmak · demo profil',
          bio: instructor?.bio ?? 'A demóban szereplő előadóhoz kapcsolódó felépített programok.',
          sequenceCount,
          courseCount,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'hu'));
  }

  presenter(slug: string): PresenterSummary | null {
    return this.presenters().find((item) => item.slug === slug) ?? null;
  }

  sequencesFor(name: string): ProgramSequence[] {
    return this.programs.sequences().filter((item) => item.creatorName === name);
  }

  coursesFor(name: string) {
    const instructor = this.flow.instructors().find((item) => item.name === name);
    return instructor
      ? this.flow.courses().filter((item) => item.instructorId === instructor.id)
      : [];
  }

  slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
