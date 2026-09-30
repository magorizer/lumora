export interface Environment {
  production: boolean;
  apiUrl: string;
  clerkPublishableKey: string;
  buildNumber: string;
  enableConsoleLogging: boolean;
}

export const environment: Environment;
