import type { Environment } from './environment.d';

export const environment: Environment = {
  production: false,
  apiUrl: 'https://REPLACE-staging-api.imoks.dev/api',
  clerkPublishableKey: 'pk_test_REPLACE_ME',
  buildNumber: '${BUILD_NUMBER}',
  enableConsoleLogging: true,
};
