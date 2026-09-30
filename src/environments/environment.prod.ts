import type { Environment } from './environment.d';

export const environment: Environment = {
  production: true,
  apiUrl: 'https://api.REPLACE.ro/api',
  clerkPublishableKey: '${CLERK_PUBLISHABLE_KEY}',
  buildNumber: '${BUILD_NUMBER}',
  enableConsoleLogging: false,
};
