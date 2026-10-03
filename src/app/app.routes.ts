import { Routes } from '@angular/router';

const onboarding = (progressCurrent: number) => ({
  layout: 'user',
  progressMode: 'onboarding',
  progressCurrent,
  progressTotal: 5,
});

const program = (progressCurrent = 3) => ({
  layout: 'user',
  progressMode: 'program',
  progressCurrent,
  progressTotal: 12,
});

export const routes: Routes = [
  { path: 'demo/1', redirectTo: 'goals', pathMatch: 'full' },
  { path: 'demo/2', redirectTo: 'questionnaire/situation', pathMatch: 'full' },
  { path: 'demo/3', redirectTo: 'questionnaire/preferences', pathMatch: 'full' },
  { path: 'demo/4', redirectTo: 'profile-summary', pathMatch: 'full' },
  { path: 'demo/5', redirectTo: 'generating', pathMatch: 'full' },
  { path: 'demo/6', redirectTo: 'packages', pathMatch: 'full' },
  { path: 'demo/7', redirectTo: 'program/customize', pathMatch: 'full' },
  { path: 'demo/8', redirectTo: 'week', pathMatch: 'full' },
  { path: 'demo/9', redirectTo: 'lesson', pathMatch: 'full' },
  { path: 'demo/10', redirectTo: 'feedback', pathMatch: 'full' },
  { path: 'demo/11', redirectTo: 'review', pathMatch: 'full' },
  { path: 'demo/12', redirectTo: 'next-cycle', pathMatch: 'full' },
  { path: 'instructor', redirectTo: 'creator/dashboard', pathMatch: 'full' },

  {
    path: '',
    loadComponent: () => import('./shell/app-shell.component').then((m) => m.AppShellComponent),
    children: [
      { path: 'home', loadComponent: () => import('./home/home.page').then((m) => m.HomePage), data: { layout: 'user', progressMode: 'none' } },
      { path: 'programs', loadComponent: () => import('./programs/programs.page').then((m) => m.ProgramsPage), data: { layout: 'user', progressMode: 'none' } },
      { path: 'packages', loadComponent: () => import('./user/pages/program.page').then((m) => m.ProgramPage), data: { layout: 'user', progressMode: 'none' } },
      { path: 'presenters', loadComponent: () => import('./presenters/presenters.page').then((m) => m.PresentersPage), data: { layout: 'user', progressMode: 'none' } },
      { path: 'presenters/:slug', loadComponent: () => import('./presenters/presenter-detail.page').then((m) => m.PresenterDetailPage), data: { layout: 'user', progressMode: 'none' } },
      { path: 'events', loadComponent: () => import('./static/events.page').then((m) => m.EventsPage), data: { layout: 'user', progressMode: 'none' } },
      { path: 'professional-help', loadComponent: () => import('./static/professional-help.page').then((m) => m.ProfessionalHelpPage), data: { layout: 'user', progressMode: 'none' } },

      { path: 'goals', loadComponent: () => import('./user/pages/goals.page').then((m) => m.GoalsPage), data: onboarding(1) },
      { path: 'questionnaire/situation', loadComponent: () => import('./user/pages/questionnaire-situation.page').then((m) => m.QuestionnaireSituationPage), data: onboarding(2) },
      { path: 'questionnaire/preferences', loadComponent: () => import('./user/pages/questionnaire-preferences.page').then((m) => m.QuestionnairePreferencesPage), data: onboarding(3) },
      { path: 'profile-summary', loadComponent: () => import('./user/pages/profile-summary.page').then((m) => m.ProfileSummaryPage), data: onboarding(4) },
      { path: 'generating', loadComponent: () => import('./user/pages/generating.page').then((m) => m.GeneratingPage), data: onboarding(5) },

      { path: 'program', redirectTo: 'packages', pathMatch: 'full' },
      { path: 'program/customize', loadComponent: () => import('./user/pages/program-customize.page').then((m) => m.ProgramCustomizePage), data: program(1) },
      { path: 'program-adjustment', redirectTo: 'program/customize', pathMatch: 'full' },
      { path: 'week', loadComponent: () => import('./user/pages/current-week.page').then((m) => m.CurrentWeekPage), data: program(1) },
      { path: 'lesson', loadComponent: () => import('./user/pages/lesson.page').then((m) => m.LessonPage), data: program(1) },
      { path: 'feedback', loadComponent: () => import('./user/pages/feedback.page').then((m) => m.FeedbackPage), data: program(1) },
      { path: 'review', loadComponent: () => import('./user/pages/review.page').then((m) => m.ReviewPage), data: program(12) },
      { path: 'next-cycle', loadComponent: () => import('./user/pages/next-cycle.page').then((m) => m.NextCyclePage), data: program(12) },

      { path: 'profile', loadComponent: () => import('./profile/profile.page').then((m) => m.ProfilePage), data: { layout: 'profile' } },

      { path: 'creator/dashboard', loadComponent: () => import('./creator/pages/creator-dashboard.page').then((m) => m.CreatorDashboardPage), data: { layout: 'creator' } },
      { path: 'creator/programs', loadComponent: () => import('./creator/pages/creator-programs.page').then((m) => m.CreatorProgramsPage), data: { layout: 'creator' } },
      { path: 'creator/courses', loadComponent: () => import('./creator/pages/creator-courses.page').then((m) => m.CreatorCoursesPage), data: { layout: 'creator' } },
      { path: 'creator/courses/new', loadComponent: () => import('./creator/pages/creator-course-new.page').then((m) => m.CreatorCourseNewPage), data: { layout: 'creator' } },
      { path: 'creator/courses/:id', loadComponent: () => import('./creator/pages/creator-course-detail.page').then((m) => m.CreatorCourseDetailPage), data: { layout: 'creator' } },
      { path: 'creator/profile', loadComponent: () => import('./creator/pages/creator-profile.page').then((m) => m.CreatorProfilePage), data: { layout: 'creator' } },

      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
