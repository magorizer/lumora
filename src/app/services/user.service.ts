import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { throwError, timer } from 'rxjs';
import { map, retry, tap } from 'rxjs/operators';

import { User } from '../models/user.model';
import { UserApiResponse } from '../models-api/user-api.model';
import { mapUserFromApi, mapUserToApi } from '../models-mappers/user.mapper';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  readonly user = signal<User | null>(null);

  getProfile() {
    return this.http.get<UserApiResponse>('api/users/profile').pipe(
      retry({
        count: 3,
        delay: (error: HttpErrorResponse) => this.retryUserNotFound(error),
      }),
      map(mapUserFromApi),
      tap((user) => this.user.set(user)),
    );
  }

  updateProfile(profile: Partial<Pick<User, 'firstName' | 'lastName'>>) {
    return this.http.put<UserApiResponse>('api/users/profile', mapUserToApi(profile)).pipe(
      map(mapUserFromApi),
      tap((user) => this.user.set(user)),
    );
  }

  private retryUserNotFound(error: HttpErrorResponse) {
    if (error.status !== 403 || error.error?.errors !== 'user_not_found') {
      return throwError(() => error);
    }

    return timer(1000);
  }
}
