import { User } from '../models/user.model';
import { UserApiResponse, UserApiUpdate } from '../models-api/user-api.model';

export function mapUserFromApi(user: UserApiResponse): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    firstName: user.first_name,
    lastName: user.last_name,
    avatar: user.avatar,
    roles: user.roles,
  };
}

export function mapUserToApi(user: Partial<Pick<User, 'firstName' | 'lastName'>>): UserApiUpdate {
  return {
    ...(typeof user.firstName === 'string' ? { first_name: user.firstName } : {}),
    ...(typeof user.lastName === 'string' ? { last_name: user.lastName } : {}),
  };
}
