import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withComponentInputBinding } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { CourseRepository, CreatorRepository, ProgramRepository, UserRepository } from './app/core/data/repositories';
import { JsonCourseRepository, JsonCreatorRepository, JsonProgramRepository, JsonUserRepository } from './app/core/data/json-repositories';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: CourseRepository, useClass: JsonCourseRepository },
    { provide: ProgramRepository, useClass: JsonProgramRepository },
    { provide: UserRepository, useClass: JsonUserRepository },
    { provide: CreatorRepository, useClass: JsonCreatorRepository },
    provideIonicAngular(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
  ],
});
