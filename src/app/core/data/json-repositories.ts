import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Catalog, Course, ProgramData, PortalumiUser, UsersData } from '../models/content.models';
import { CourseRepository, CreatorRepository, ProgramRepository, UserRepository } from './repositories';

@Injectable()
export class JsonCourseRepository extends CourseRepository {
  private readonly http = inject(HttpClient);
  override loadCatalog(): Promise<Catalog> {
    return firstValueFrom(this.http.get<Catalog>('assets/demo/catalog.json'));
  }
}

@Injectable()
export class JsonProgramRepository extends ProgramRepository {
  private readonly http = inject(HttpClient);
  override loadPrograms(): Promise<ProgramData> {
    return firstValueFrom(this.http.get<ProgramData>('assets/demo/flows.json'));
  }
}

@Injectable()
export class JsonUserRepository extends UserRepository {
  private readonly http = inject(HttpClient);
  override async loadUsers(): Promise<PortalumiUser[]> {
    return (await firstValueFrom(this.http.get<UsersData>('assets/demo/users.json'))).users;
  }
}

@Injectable()
export class JsonCreatorRepository extends CreatorRepository {
  override async saveDraft(course: Course): Promise<Course> {
    return { ...course, status: 'draft' };
  }
  override async publish(course: Course): Promise<Course> {
    return { ...course, status: 'published' };
  }
}
