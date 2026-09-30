import { Routes } from '@angular/router';
import { canActivateClerk, catchAllRoute } from 'ngx-clerk';

export const routes: Routes = [
  {
    matcher: catchAllRoute('sign-in'),
    loadComponent: () => import('./auth/sign-in/sign-in.page').then((m) => m.SignInPage),
  },
  {
    matcher: catchAllRoute('sign-up'),
    loadComponent: () => import('./auth/sign-up/sign-up.page').then((m) => m.SignUpPage),
  },
  {
    path: 'onboarding',
    canActivate: [canActivateClerk],
    loadComponent: () => import('./onboarding/onboarding.page').then((m) => m.OnboardingPage),
  },
  {
    path: 'app',
    canActivate: [canActivateClerk],
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'today',
        loadComponent: () => import('./today/today.page').then((m) => m.TodayPage),
      },
      {
        path: 'patterns',
        loadComponent: () => import('./patterns/patterns.page').then((m) => m.PatternsPage),
      },
      {
        path: 'check-in',
        loadComponent: () => import('./checkin/checkin.page').then((m) => m.CheckinPage),
      },
      {
        path: 'goals',
        loadComponent: () => import('./goals/goals.page').then((m) => m.GoalsPage),
      },
      {
        path: 'me',
        loadComponent: () => import('./me/me.page').then((m) => m.MePage),
      },
      { path: '', redirectTo: 'today', pathMatch: 'full' },
    ],
  },
  { path: 'home', redirectTo: 'app/today', pathMatch: 'full' },
  { path: '', redirectTo: 'app/today', pathMatch: 'full' },
  { path: '**', redirectTo: 'app/today' },
];
