import { Catalog, Course, ProgramData, PortalumiUser } from '../models/content.models';

export abstract class CourseRepository {
  abstract loadCatalog(): Promise<Catalog>;
}

export abstract class ProgramRepository {
  abstract loadPrograms(): Promise<ProgramData>;
}

export abstract class UserRepository {
  abstract loadUsers(): Promise<PortalumiUser[]>;
}

export abstract class CreatorRepository {
  abstract saveDraft(course: Course): Promise<Course>;
  abstract publish(course: Course): Promise<Course>;
}
