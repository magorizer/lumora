# Home
> Overview of ngx-clerk — the unofficial Angular SDK for Clerk authentication, covering features, installation, and requirements.
Source: https://anagstef.github.io/ngx-clerk/

# ngx-clerk

Unofficial Clerk SDK for Angular (Core 3) — 13 prebuilt UI components, a reactive `ClerkService` built on Angular signals, control-flow directives (`*clerkSignedIn`, `*clerkSignedOut`, `*clerkLoaded`, `*clerkLoading`), the `*clerkProtect` authorization directive, button directives (`clerkSignInButton`, `clerkSignUpButton`, `clerkSignOutButton`), and route guards (`canActivateClerk`, `canActivateProtect`) for authentication, user management, and organizations.

> **Disclaimer:** This is an unofficial, community-maintained package and is not affiliated with Clerk.com.

## Install

```bash
npm install ngx-clerk
```

## Get started

- [Quickstart](https://anagstef.github.io/ngx-clerk/quickstart.html) — add authentication to a new app in a few steps
- [Migration guide](https://github.com/anagstef/ngx-clerk/blob/main/MIGRATION.md) — upgrading from v0.x to v1.0

## Guides

- [Authentication](https://anagstef.github.io/ngx-clerk/authentication.html) — sign-in/up, auth buttons, and control-flow directives
- [Protecting routes](https://anagstef.github.io/ngx-clerk/protecting-routes.html) — guards and the `*clerkProtect` directive
- [Reading auth state](https://anagstef.github.io/ngx-clerk/reading-auth-state.html) — the `ClerkService` signals
- [Session tokens](https://anagstef.github.io/ngx-clerk/session-tokens.html) — call your backend with `getToken()`
- [Organizations & roles](https://anagstef.github.io/ngx-clerk/organizations.html) — org components, roles, permissions, features, and plans
- [Components](https://anagstef.github.io/ngx-clerk/components.html) — all 13 prebuilt Clerk UI components
- [ClerkService](https://anagstef.github.io/ngx-clerk/clerk-service.html) — every signal and method, with `effect()` examples

## Requirements

- Angular 20 or higher
- Clerk Core 3 (ClerkJS v6)
- Client-side rendering only — Server-Side Rendering (SSR) is not supported yet

## Links

- [GitHub](https://github.com/anagstef/ngx-clerk)
- [npm](https://www.npmjs.com/package/ngx-clerk)

---

# Quickstart
> Step-by-step guide to adding Clerk authentication to a new Angular 20+ app with ngx-clerk.
Source: https://anagstef.github.io/ngx-clerk/quickstart.html

# Quickstart

Add authentication to a new Angular app with ngx-clerk.

## Before you start

- [Create a Clerk application](https://dashboard.clerk.com/) in the Clerk Dashboard and copy your **Publishable Key**.
- This guide assumes a standalone Angular 20+ app with the router.

## Create a new Angular app

```bash
ng new my-app --routing --style=css
cd my-app
```

## Install ngx-clerk

```bash
npm install ngx-clerk
```

## Set your Clerk Publishable Key

Add your key to the environment file:

```ts
// src/environments/environment.ts
export const environment = {
  clerkPublishableKey: 'pk_test_XXXX',
};
```

## Add `provideClerk` to your app

Register Clerk in your application config with your Publishable Key and your sign-in/up URLs:

```ts
// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClerk } from 'ngx-clerk';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClerk({
      publishableKey: environment.clerkPublishableKey,
      signInUrl: '/sign-in',
      signUpUrl: '/sign-up',
    }),
  ],
};
```

## Add sign-in and sign-up routes

Mount the sign-in and sign-up components on **catch-all routes** so Clerk can handle their sub-routes (e.g. `/sign-in/factor-one`):

```ts
// src/app/sign-in.component.ts
import { Component } from '@angular/core';
import { ClerkSignInComponent } from 'ngx-clerk';

@Component({
  selector: 'app-sign-in',
  imports: [ClerkSignInComponent],
  template: `<clerk-sign-in [props]="{ routing: 'path', path: '/sign-in', signUpUrl: '/sign-up' }" />`,
})
export class SignInComponent {}
```

```ts
// src/app/sign-up.component.ts
import { Component } from '@angular/core';
import { ClerkSignUpComponent } from 'ngx-clerk';

@Component({
  selector: 'app-sign-up',
  imports: [ClerkSignUpComponent],
  template: `<clerk-sign-up [props]="{ routing: 'path', path: '/sign-up', signInUrl: '/sign-in' }" />`,
})
export class SignUpComponent {}
```

```ts
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { catchAllRoute } from 'ngx-clerk';

export const routes: Routes = [
  {
    matcher: catchAllRoute('sign-in'),
    loadComponent: () => import('./sign-in.component').then((m) => m.SignInComponent),
  },
  {
    matcher: catchAllRoute('sign-up'),
    loadComponent: () => import('./sign-up.component').then((m) => m.SignUpComponent),
  },
];
```

More on both components, and on the `clerkSignInButton` / `clerkSignUpButton` directives, under [Authentication](https://anagstef.github.io/ngx-clerk/authentication.html).

## Add a guarded route

Restrict a route to signed-in users with the `canActivateClerk` guard:

```ts
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { canActivateClerk, catchAllRoute } from 'ngx-clerk';

export const routes: Routes = [
  {
    matcher: catchAllRoute('sign-in'),
    loadComponent: () => import('./sign-in.component').then((m) => m.SignInComponent),
  },
  {
    matcher: catchAllRoute('sign-up'),
    loadComponent: () => import('./sign-up.component').then((m) => m.SignUpComponent),
  },
  {
    path: 'dashboard',
    canActivate: [canActivateClerk],
    loadComponent: () => import('./dashboard.component').then((m) => m.DashboardComponent),
  },
];
```

`dashboard.component.ts` can be any component you like — it's only reachable once `canActivateClerk` confirms the visitor is signed in. See [Protecting routes](https://anagstef.github.io/ngx-clerk/protecting-routes.html) for role- and permission-based guards.

## Build the header

Use the control-flow directives and the user button to build a header that reacts to auth state:

```ts
// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import {
  ClerkSignedInDirective,
  ClerkSignedOutDirective,
  ClerkUserButtonComponent,
} from 'ngx-clerk';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, ClerkSignedInDirective, ClerkSignedOutDirective, ClerkUserButtonComponent],
  template: `
    <header>
      <a *clerkSignedOut routerLink="/sign-in">Sign in</a>
      <a *clerkSignedIn routerLink="/dashboard">Dashboard</a>
      <clerk-user-button *clerkSignedIn />
    </header>
    <router-outlet />
  `,
})
export class AppComponent {}
```

## Run your app

```bash
ng serve
```

Open `http://localhost:4200`. You'll see the **Sign in** link; once you've signed in, the **Dashboard** link and the user button appear in its place.

## Create your first user

1. Run your app and click **Sign in**.
2. Complete the sign-up flow in the Clerk UI.
3. Find the new user in the [Clerk Dashboard](https://dashboard.clerk.com/) under **Users**.

## Next steps

- [Authentication](https://anagstef.github.io/ngx-clerk/authentication.html) — sign-in/up components, auth buttons, and control-flow directives
- [Protecting routes](https://anagstef.github.io/ngx-clerk/protecting-routes.html) — route guards and the `*clerkProtect` directive
- [Reading auth state](https://anagstef.github.io/ngx-clerk/reading-auth-state.html) — access the current user, session, and organization
- [Session tokens](https://anagstef.github.io/ngx-clerk/session-tokens.html) — authenticate your backend with `getToken()`

---

# Authentication
> How to add sign-in/sign-up pages, auth buttons, control-flow directives, and an SSO callback route.
Source: https://anagstef.github.io/ngx-clerk/authentication.html

# Authentication

## Sign-in and sign-up pages

ngx-clerk renders Clerk's prebuilt UI. Mount the sign-in component on a **catch-all route** so Clerk can handle its sub-routes (e.g. `/sign-in/factor-one`):

```ts
// src/app/sign-in.component.ts
import { Component } from '@angular/core';
import { ClerkSignInComponent } from 'ngx-clerk';

@Component({
  selector: 'app-sign-in',
  imports: [ClerkSignInComponent],
  template: `<clerk-sign-in [props]="{ routing: 'path', path: '/sign-in', signUpUrl: '/sign-up' }" />`,
})
export class SignInComponent {}
```

```ts
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { catchAllRoute } from 'ngx-clerk';

export const routes: Routes = [
  {
    matcher: catchAllRoute('sign-in'),
    loadComponent: () => import('./sign-in.component').then((m) => m.SignInComponent),
  },
  {
    matcher: catchAllRoute('sign-up'),
    loadComponent: () => import('./sign-up.component').then((m) => m.SignUpComponent),
  },
];
```

The sign-up page follows the same pattern with `<clerk-sign-up [props]="{ routing: 'path', path: '/sign-up', signInUrl: '/sign-in' }" />`.

When `[props]` genuinely changes, the component re-mounts with the new configuration; inline object literals that are structurally equal are detected and do not cause re-mounts, so it's safe to bind a literal in the template.

## Auth buttons

Attribute directives trigger auth actions on your own button — no extra DOM, so you keep full control of styling:

```html
<button clerkSignInButton>Sign in</button>
<button clerkSignUpButton mode="modal">Create account</button>
<button clerkSignOutButton redirectUrl="/">Sign out</button>
```

Each button directive defaults to `redirect` mode, which navigates to your sign-in/up page; `mode="modal"` opens Clerk's modal instead. The full set of inputs, exactly as declared on each directive:

### `clerkSignInButton`

| Input | Type | Description |
| --- | --- | --- |
| `mode` | `'redirect' \| 'modal'` | `'redirect'` (default) navigates to the sign-in page; `'modal'` opens the modal |
| `forceRedirectUrl` | `string` | Always redirect here after sign-in |
| `fallbackRedirectUrl` | `string` | Redirect here after sign-in if no other redirect URL applies |
| `signUpForceRedirectUrl` | `string` | Same as `forceRedirectUrl`, applied if the user signs up instead |
| `signUpFallbackRedirectUrl` | `string` | Same as `fallbackRedirectUrl`, applied if the user signs up instead |

### `clerkSignUpButton`

| Input | Type | Description |
| --- | --- | --- |
| `mode` | `'redirect' \| 'modal'` | `'redirect'` (default) navigates to the sign-up page; `'modal'` opens the modal |
| `forceRedirectUrl` | `string` | Always redirect here after sign-up |
| `fallbackRedirectUrl` | `string` | Redirect here after sign-up if no other redirect URL applies |
| `signInForceRedirectUrl` | `string` | Same as `forceRedirectUrl`, applied if the user signs in instead |
| `signInFallbackRedirectUrl` | `string` | Same as `fallbackRedirectUrl`, applied if the user signs in instead |

### `clerkSignOutButton`

| Input | Type | Description |
| --- | --- | --- |
| `redirectUrl` | `string` | URL to navigate to after signing out |
| `sessionId` | `string` | Sign out of one specific session; omit to sign out of every session on the device |

`redirectUrl` only exists on `clerkSignOutButton` — the sign-in/up buttons use the more specific `forceRedirectUrl` / `fallbackRedirectUrl` pair instead:

```html
<button clerkSignInButton mode="modal" fallbackRedirectUrl="/dashboard">Sign in</button>
<button clerkSignOutButton redirectUrl="/" sessionId="sess_xxx">Sign out of this device</button>
```

## Control-flow directives

Render content conditionally on auth state with structural directives — no need to read signals manually:

```html
<span *clerkLoading>Loading…</span>

<ng-container *clerkLoaded>
  <clerk-user-button *clerkSignedIn />
  <button *clerkSignedOut clerkSignInButton>Sign in</button>
</ng-container>
```

| Directive | Renders when |
| --- | --- |
| `*clerkSignedIn` | a user is signed in |
| `*clerkSignedOut` | Clerk is loaded and no user is signed in |
| `*clerkLoaded` | Clerk has finished loading |
| `*clerkLoading` | Clerk is still loading |

## Google One Tap

```html
<clerk-google-one-tap />
```

It opens automatically once Clerk has loaded and closes when the component is destroyed. Prop changes made after that initial open are not re-applied.

## OAuth / SSO callback

For custom OAuth flows, render the callback component on your `/sso-callback` route to complete the redirect:

```ts
// src/app/sso-callback.component.ts
import { Component } from '@angular/core';
import { ClerkAuthenticateWithRedirectCallbackComponent } from 'ngx-clerk';

@Component({
  selector: 'app-sso-callback',
  imports: [ClerkAuthenticateWithRedirectCallbackComponent],
  template: `
    <clerk-authenticate-with-redirect-callback
      [props]="{ signInFallbackRedirectUrl: '/dashboard', signUpFallbackRedirectUrl: '/dashboard' }" />
  `,
})
export class SsoCallbackComponent {}
```

```ts
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { catchAllRoute } from 'ngx-clerk';

export const routes: Routes = [
  // … existing routes …
  {
    path: 'sso-callback',
    loadComponent: () => import('./sso-callback.component').then((m) => m.SsoCallbackComponent),
  },
];
```

---

# Protecting routes
> How to restrict routes and template sections by authentication state, role, or permission.
Source: https://anagstef.github.io/ngx-clerk/protecting-routes.html

# Protecting routes

## Require authentication

Use the `canActivateClerk` guard to restrict a route to signed-in users:

```ts
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { canActivateClerk } from 'ngx-clerk';

export const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: [canActivateClerk],
    loadComponent: () => import('./dashboard.component').then((m) => m.DashboardComponent),
  },
];
```

`canActivateClerk` is race-free: if Clerk hasn't finished loading yet when the route is activated, the guard waits for `isLoaded()` to become `true` before deciding, instead of evaluating a stale or default auth state. Once loaded, unauthenticated users are redirected to the Clerk sign-in page.

## Require a role or permission

`canActivateProtect` creates a guard that restricts a route to users satisfying an authorization condition, with this signature:

```ts
function canActivateProtect(
  params: CheckAuthorizationParams,
  options: CanActivateProtectOptions = {},
): CanActivateFn
```

`params` is the same `{ role | permission | feature | plan }` shape accepted by `has()` and `*clerkProtect`. `options.unauthorizedUrl` is where a signed-in-but-unauthorized user is redirected; omit it and they're simply blocked (the guard returns `false`). Unauthenticated users are always redirected to sign-in first:

```ts
import { Routes } from '@angular/router';
import { canActivateProtect } from 'ngx-clerk';

export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [canActivateProtect({ role: 'org:admin' }, { unauthorizedUrl: '/dashboard' })],
    loadComponent: () => import('./admin.component').then((m) => m.AdminComponent),
  },
];
```

See also [Organizations & roles](https://anagstef.github.io/ngx-clerk/organizations.html) for where roles and permissions come from.

## Gate UI with `*clerkProtect`

Protect part of a template by role, permission, feature, or plan. An optional `else` template renders when the user is unauthorized:

```html
<section *clerkProtect="{ role: 'org:admin' }; else noAccess">
  Admins only
</section>
<ng-template #noAccess>You do not have access.</ng-template>
```

For conditions that don't reduce to a single role/permission/feature/plan check, pass a predicate over `has` instead — this is the `ClerkProtectCondition` type exported from `ngx-clerk`:

```html
<section *clerkProtect="isBillingAdmin">Manage billing</section>
```

```ts
import type { CheckAuthorizationWithCustomPermissions } from 'ngx-clerk';

readonly isBillingAdmin = (has: CheckAuthorizationWithCustomPermissions) =>
  has({ role: 'org:admin' }) || has({ permission: 'org:billing:manage' });
```

`canActivateProtect` and `*clerkProtect` evaluate `role` and `permission` conditions against the active organization (`feature` and `plan` conditions can be organization- or user-scoped). See [Reading auth state](https://anagstef.github.io/ngx-clerk/reading-auth-state.html) for the `organization()`, `orgRole()`, and `membership()` signals backing them.

## Check authorization imperatively

`ClerkService.has()` returns a boolean for the same conditions:

```ts
if (clerk.has({ permission: 'org:posts:manage' })) {
  // …
}
```

---

# Reading auth state
> How to read Clerk's reactive state — user, session, and organization — from Angular signals via ClerkService.
Source: https://anagstef.github.io/ngx-clerk/reading-auth-state.html

# Reading auth state

`ClerkService` exposes Clerk's state as Angular signals. Inject it anywhere:

```ts
import { Component, inject } from '@angular/core';
import { ClerkService } from 'ngx-clerk';

@Component({
  selector: 'app-profile',
  template: `<!-- … -->`,
})
export class ProfileComponent {
  protected readonly clerk = inject(ClerkService);
}
```

Read the signals in a template:

```html
@if (clerk.user(); as user) {
  <p>Hello {{ user.firstName }}</p>
}
```

## Signals

| Signal | Description |
| --- | --- |
| `clerk()` | the Clerk instance, or `null` until loaded |
| `client()` | the current Clerk `ClientResource`, or `null` |
| `session()` | the active session, or `null` |
| `user()` | the current `UserResource`, or `null` |
| `organization()` | the active organization, or `null` |
| `isLoaded()` | whether Clerk has finished loading |
| `isSignedIn()` | whether a user is signed in |
| `userId()`, `orgId()`, `sessionId()` | the corresponding IDs, or `null` |
| `orgRole()`, `orgSlug()` | the user's role in, and slug of, the active organization |
| `sessionClaims()`, `actor()` | the active session's JWT claims, and the actor (impersonation) claim |
| `signIn()`, `signUp()` | the active sign-in / sign-up attempt resources |
| `sessions()` | every session registered on the current device |
| `membership()` | the user's membership in the active organization |

## Control-flow directives

Structural directives read the same state so you don't have to check signals manually in templates:

| Directive | Renders when |
| --- | --- |
| `*clerkSignedIn` | a user is signed in |
| `*clerkSignedOut` | Clerk is loaded and no user is signed in |
| `*clerkLoaded` | Clerk has finished loading |
| `*clerkLoading` | Clerk is still loading |

See [Authentication](https://anagstef.github.io/ngx-clerk/authentication.html) for examples combining them with the user button and auth buttons.

## Methods

| Method | Description |
| --- | --- |
| `has(params)` | check a role / permission / feature / plan |
| `getToken(options?)` | get the current session JWT |
| `setActive(params)` | switch the active session or organization |
| `handleRedirectCallback(params?)` | complete an OAuth/SSO redirect |
| `signOut(options?)` | sign the current user out |
| `redirectToSignIn()`, `redirectToSignUp()` | navigate to the Clerk sign-in/up pages |
| `openSignIn()`, `openUserProfile()`, … | open the modal UIs (with matching `close*` helpers) |
| `updateAppearance(opts)`, `updateLocalization(opts)` | update just the appearance or localization config |
| `updateClerkOptions(options)` | update appearance and/or localization together |

## Using an Observable

All reactive state on `ClerkService` is exposed as signals (methods like `has()` or `signOut()` are plain calls). If you need an `Observable` — to combine auth state with `HttpClient` streams, for example — convert any state signal with `toObservable()` from `@angular/core/rxjs-interop`:

```ts
import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ClerkService } from 'ngx-clerk';

const clerk = inject(ClerkService);
const user$ = toObservable(clerk.user);
```

---

# Session tokens
> How to retrieve session JWTs with getToken() and attach them to backend requests.
Source: https://anagstef.github.io/ngx-clerk/session-tokens.html

# Session tokens

Call `ClerkService.getToken()` to retrieve the current session JWT and authenticate requests to your backend. It resolves to `null` when no user is signed in.

```ts
const token = await clerk.getToken();
```

You can also request a token for a specific [JWT template](https://clerk.com/docs/backend-requests/making/jwt-templates):

```ts
const token = await clerk.getToken({ template: 'my-template' });
```

## Handling offline errors

In Clerk Core 3, `getToken()` throws a `ClerkOfflineError` — instead of resolving to `null` — when the request fails because the client is offline. Catch it with the `isClerkRuntimeError` guard, or the more specific `ClerkOfflineError.is()`:

```ts
import { ClerkOfflineError, isClerkRuntimeError } from 'ngx-clerk';

try {
  const token = await clerk.getToken();
} catch (error) {
  if (ClerkOfflineError.is(error)) {
    // the client is offline — show a banner, retry later, etc.
  } else if (isClerkRuntimeError(error)) {
    // some other Clerk runtime error; error.code has the details
  } else {
    throw error;
  }
}
```

## In an HTTP interceptor

Attach the token to outgoing requests with a functional interceptor:

```ts
// src/app/clerk-auth.interceptor.ts
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { from, switchMap } from 'rxjs';
import { ClerkService } from 'ngx-clerk';

export const clerkAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const clerk = inject(ClerkService);
  return from(clerk.getToken()).pipe(
    switchMap((token) =>
      next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req),
    ),
  );
};
```

If `getToken()` rejects — for example with `ClerkOfflineError` while the client is offline — the failure propagates into the request's error path, so subscribers see it like any other failed request. That's usually what you want; add a `catchError` to the pipe if you'd rather fall back to a different behavior.

Register it in your app config:

```ts
// src/app/app.config.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { clerkAuthInterceptor } from './clerk-auth.interceptor';

export const appConfig = {
  providers: [
    provideHttpClient(withInterceptors([clerkAuthInterceptor])),
    // …provideClerk, provideRouter, etc.
  ],
};
```

---

# Organizations & roles
> How to render organization components and gate access by role, permission, feature, or plan.
Source: https://anagstef.github.io/ngx-clerk/organizations.html

# Organizations & roles

Clerk's organizations feature lets users belong to shared workspaces with roles and
permissions. ngx-clerk covers it with four prebuilt components, an authorization check on
`ClerkService`, the `*clerkProtect` directive, and the `canActivateProtect` guard.

## Organization components

Four of the [13 components](https://anagstef.github.io/ngx-clerk/components.html) manage organizations. They mount the
same way as every other Clerk component, with no required `[props]`:

| Component | Selector | Renders |
| --- | --- | --- |
| `ClerkOrganizationSwitcherComponent` | `clerk-organization-switcher` | dropdown to switch the active organization or personal account |
| `ClerkOrganizationProfileComponent` | `clerk-organization-profile` | settings, members, and invitations for the active organization |
| `ClerkCreateOrganizationComponent` | `clerk-create-organization` | form to create a new organization |
| `ClerkOrganizationListComponent` | `clerk-organization-list` | every organization the user belongs to, with actions to switch or create |

```ts
// src/app/dashboard/dashboard-home.component.ts
import { Component } from '@angular/core';
import { ClerkOrganizationSwitcherComponent } from 'ngx-clerk';

@Component({
  selector: 'app-dashboard-home',
  imports: [ClerkOrganizationSwitcherComponent],
  template: `<clerk-organization-switcher />`,
})
export class DashboardHomeComponent {}
```

`ClerkOrganizationProfileComponent`, `ClerkCreateOrganizationComponent`, and
`ClerkOrganizationListComponent` follow the same pattern — `<clerk-organization-profile />`,
`<clerk-create-organization />`, `<clerk-organization-list />`. See
[Components](https://anagstef.github.io/ngx-clerk/components.html) for their full `[props]` types and path-routing support.

## Checking roles, permissions, features, and plans

`ClerkService.has()` checks the current user's authorization against the cached session JWT
claims — it never makes a network request:

```ts
has(params: CheckAuthorizationParams): boolean
```

`CheckAuthorizationParams` (exported from `ngx-clerk`) accepts the same
`{ role | permission | feature | plan }` shape used by `*clerkProtect` and route guards —
exactly one of the four:

```ts
clerk.has({ role: 'org:admin' });
clerk.has({ permission: 'org:posts:manage' });
clerk.has({ feature: 'user:premium_support' });
clerk.has({ plan: 'org:pro' });
```

`role` and `permission` are evaluated against the **active organization** — both are `false`
if there's no active organization, even for a signed-in user. `feature` and `plan` are looked
up by scope prefix (`org:` or `user:`) in the session claims. **While signed out, `has()`
always returns `false`**, regardless of the params passed. See
[Roles and permissions](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions)
and [features and plans](https://clerk.com/docs/guides/billing/overview) for how these are
configured in the Clerk Dashboard.

## Gate UI with `*clerkProtect`

`*clerkProtect` renders its content only when the condition is authorized, with an optional
`else` template for the unauthorized case:

```html
<section *clerkProtect="{ role: 'org:admin' }; else notAdmin">
  You have the <code>org:admin</code> role in the active organization.
</section>
<ng-template #notAdmin>
  You need the <code>org:admin</code> role to see this content.
</ng-template>
```

See [Protecting routes](https://anagstef.github.io/ngx-clerk/protecting-routes.html) for the predicate form
(`*clerkProtect="fn"`) and the rest of the guard reference.

## Guard a route by role

`canActivateProtect` creates a guard from the same `CheckAuthorizationParams` shape.
Unauthenticated users are redirected to sign-in; signed-in-but-unauthorized users are blocked
or sent to `unauthorizedUrl`:

```ts
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { canActivateProtect } from 'ngx-clerk';

export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [canActivateProtect({ role: 'org:admin' }, { unauthorizedUrl: '/dashboard' })],
    loadComponent: () => import('./admin.component').then((m) => m.AdminComponent),
  },
];
```

## Reading organization state

`ClerkService` exposes the active organization as signals — see
[Reading auth state](https://anagstef.github.io/ngx-clerk/reading-auth-state.html) for the complete signal table and
[ClerkService](https://anagstef.github.io/ngx-clerk/clerk-service.html) for every method:

| Signal | Description |
| --- | --- |
| `organization()` | the active organization resource, or `null` if none is active |
| `orgId()`, `orgSlug()` | the active organization's ID and slug |
| `orgRole()` | the current user's role in the active organization |
| `membership()` | the current user's membership in the active organization — carries `.role` and `.permissions` |

```ts
const clerk = inject(ClerkService);
clerk.orgRole(); // e.g. 'org:admin', or null with no active organization
clerk.membership()?.permissions; // e.g. ['org:posts:manage', …]
```

Switch the active organization with `setActive()`:

```ts
await clerk.setActive({ organization: orgId });
```

---

# Components
> All 13 Clerk UI components for Angular with their inputs.
Source: https://anagstef.github.io/ngx-clerk/components.html

# Components

ngx-clerk ships 13 standalone components that mount Clerk's prebuilt UI. Import them
individually from `ngx-clerk`; every one is `ChangeDetectionStrategy.OnPush` with
`ViewEncapsulation.None` so Clerk's own styles can reach into the DOM it mounts.

Every `[props]` type below lives in `@clerk/shared/types` and is re-exported by `ngx-clerk`
itself, so `import type { SignInProps } from 'ngx-clerk';` works without adding
`@clerk/shared` as a direct dependency.

| Component | Selector | Props type |
| --- | --- | --- |
| `ClerkSignInComponent` | `clerk-sign-in` | `SignInProps` |
| `ClerkSignUpComponent` | `clerk-sign-up` | `SignUpProps` |
| `ClerkUserProfileComponent` | `clerk-user-profile` | `UserProfileProps` |
| `ClerkUserButtonComponent` | `clerk-user-button` | `UserButtonProps` |
| `ClerkUserAvatarComponent` | `clerk-user-avatar` | `UserAvatarProps` |
| `ClerkOrganizationProfileComponent` | `clerk-organization-profile` | `OrganizationProfileProps` |
| `ClerkOrganizationSwitcherComponent` | `clerk-organization-switcher` | `OrganizationSwitcherProps` |
| `ClerkCreateOrganizationComponent` | `clerk-create-organization` | `CreateOrganizationProps` |
| `ClerkOrganizationListComponent` | `clerk-organization-list` | `OrganizationListProps` |
| `ClerkWaitlistComponent` | `clerk-waitlist` | `WaitlistProps` |
| `ClerkPricingTableComponent` | `clerk-pricing-table` | `PricingTableProps` |
| `ClerkGoogleOneTapComponent` | `clerk-google-one-tap` | `GoogleOneTapProps` |
| `ClerkAuthenticateWithRedirectCallbackComponent` | `clerk-authenticate-with-redirect-callback` | `HandleOAuthCallbackParams` |

## Path routing

Five components — Sign In, Sign Up, User Profile, Organization Profile, and Create
Organization — accept a `routing`/`path` pair in their props. Set `routing: 'path'` and a
`path` to give the component its own addressable Angular route instead of Clerk's default
in-place navigation, and pair it with a `catchAllRoute` matcher so Clerk's own sub-routes
(e.g. `/sign-in/factor-one`) fall under the same route:

```ts
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { catchAllRoute } from 'ngx-clerk';

export const routes: Routes = [
  {
    matcher: catchAllRoute('sign-in'),
    loadComponent: () => import('./sign-in.component').then((m) => m.SignInComponent),
  },
];
```

```html
<clerk-sign-in [props]="{ routing: 'path', path: '/sign-in', signUpUrl: '/sign-up' }" />
```

Omit `routing`/`path` and the component manages its own sub-navigation in place — this is how
the other three routed components (User Profile, Organization Profile, Create Organization)
are typically used, each already living at its own Angular route. See
[Quickstart](https://anagstef.github.io/ngx-clerk/quickstart.html) for the full route setup.

## Prop reactivity

11 of the 13 components — every one except Google One Tap and Authenticate With Redirect
Callback, both covered below — mount through a shared internal helper: it mounts once the
Clerk instance and host element are both ready, re-mounts whenever `[props]` genuinely
changes so the update takes effect, and unmounts when the component is destroyed. Inline
object literals that are structurally equal to the previous value do not trigger a re-mount,
so it's safe to bind a literal directly in the template rather than hoisting it to a class
field.

The two exceptions:

- **Google One Tap** opens once, the first time Clerk finishes loading, and closes on
  destroy — prop changes after that initial open are not re-applied.
- **Authenticate With Redirect Callback** never mounts anything into the DOM. It calls
  `handleRedirectCallback()` exactly once, the first time Clerk is available; changing
  `[props]` afterward has no effect since the callback already ran.

## Sign In

`clerk-sign-in` · `ClerkSignInComponent` · props: `SignInProps`

```html
<clerk-sign-in [props]="{ routing: 'path', path: '/sign-in', signUpUrl: '/sign-up' }" />
```

See [Authentication](https://anagstef.github.io/ngx-clerk/authentication.html) for the full catch-all route setup and the
auth button directives.

## Sign Up

`clerk-sign-up` · `ClerkSignUpComponent` · props: `SignUpProps`

```html
<clerk-sign-up [props]="{ routing: 'path', path: '/sign-up', signInUrl: '/sign-in' }" />
```

## User Profile

`clerk-user-profile` · `ClerkUserProfileComponent` · props: `UserProfileProps`

Account settings, email addresses, and security — the same UI `openUserProfile()` opens in a
modal, mounted in place instead. Supports [path routing](#path-routing).

```html
<clerk-user-profile />
```

## User Button

`clerk-user-button` · `ClerkUserButtonComponent` · props: `UserButtonProps`

Trigger button that opens the account menu, with sign-out and (from the menu) the user
profile.

```html
<clerk-user-button />
```

## User Avatar

`clerk-user-avatar` · `ClerkUserAvatarComponent` · props: `UserAvatarProps`

Just the user's avatar image, without the button chrome around it — useful in a list of items
that each belong to a user, like a session picker.

```html
<clerk-user-avatar />
```

## Organization Profile

`clerk-organization-profile` · `ClerkOrganizationProfileComponent` · props:
`OrganizationProfileProps`

Settings, members, and invitations for the active organization. Supports
[path routing](#path-routing). See [Organizations & roles](https://anagstef.github.io/ngx-clerk/organizations.html).

```html
<clerk-organization-profile />
```

## Organization Switcher

`clerk-organization-switcher` · `ClerkOrganizationSwitcherComponent` · props:
`OrganizationSwitcherProps`

Dropdown to switch the active organization, or the user's personal account.

```html
<clerk-organization-switcher />
```

## Create Organization

`clerk-create-organization` · `ClerkCreateOrganizationComponent` · props:
`CreateOrganizationProps`

Form to create a new organization. Supports [path routing](#path-routing).

```html
<clerk-create-organization />
```

## Organization List

`clerk-organization-list` · `ClerkOrganizationListComponent` · props: `OrganizationListProps`

Every organization the user belongs to, with actions to switch to one or create a new one.

```html
<clerk-organization-list />
```

## Waitlist

`clerk-waitlist` · `ClerkWaitlistComponent` · props: `WaitlistProps`

Collects an email address for Clerk's waitlist flow, used when sign-ups are gated behind
approval.

```html
<clerk-waitlist />
```

## Pricing Table

`clerk-pricing-table` · `ClerkPricingTableComponent` · props: `PricingTableProps`

Renders the plans configured for billing in the Clerk Dashboard.

```html
<clerk-pricing-table />
```

## Google One Tap

`clerk-google-one-tap` · `ClerkGoogleOneTapComponent` · props: `GoogleOneTapProps`

Google's One Tap sign-in prompt. Does not support path routing; see
[Prop reactivity](#prop-reactivity) above for its open-once behavior.

```html
<clerk-google-one-tap />
```

## Authenticate With Redirect Callback

`clerk-authenticate-with-redirect-callback` · `ClerkAuthenticateWithRedirectCallbackComponent`
· props: `HandleOAuthCallbackParams`

Completes an OAuth/SSO redirect flow. Renders nothing — place it on your callback route; see
[Prop reactivity](#prop-reactivity) above for its call-once behavior.

```html
<clerk-authenticate-with-redirect-callback
  [props]="{ signInFallbackRedirectUrl: '/dashboard', signUpFallbackRedirectUrl: '/dashboard' }" />
```

See [Authentication](https://anagstef.github.io/ngx-clerk/authentication.html) for the full `/sso-callback` route setup.

## Not yet supported

- **Custom pages and menu items** — `customPages` (User Profile, Organization Profile) and
  `customMenuItems` (User Button) exist on the underlying prop types, but there's no
  Angular-idiomatic way yet to author the raw `mount`/`unmount` DOM callbacks they expect.
- **`<APIKeys />`** — no dedicated component; `apiKeysProps` only configures the built-in API
  Keys page inside User Profile / Organization Profile.
- **`<OAuthConsent />`** — not wrapped.
- **Experimental billing buttons** (checkout, plan details, subscription details buttons) —
  only Pricing Table is wrapped.
- **Metamask and other Web3 wallet flows** — not wrapped.
- **Session tasks (Core 3)** — after-auth task routing (e.g. forced organization selection);
  pending sessions are treated as signed-in across the full auth surface. See
  [ClerkService](https://anagstef.github.io/ngx-clerk/clerk-service.html).
- **Server-side rendering** — client-side rendering only. See [Home](https://anagstef.github.io/ngx-clerk).

---

# ClerkService
> Every signal and method on ClerkService, with effect() and error-handling examples.
Source: https://anagstef.github.io/ngx-clerk/clerk-service.html

# ClerkService

`ClerkService` is the reactive core of ngx-clerk: an injectable, `providedIn: 'root'` service
that wraps the Clerk instance in Angular signals. [`provideClerk()`](https://anagstef.github.io/ngx-clerk/quickstart.html)
calls `initialize()` once at application startup — everything else below is safe to call
anywhere the service is injected.

> `initialize(options: ClerkInitOptions): Promise<void>` is **internal**. `provideClerk()`
> calls it once during application bootstrap; calling it yourself logs a warning and resolves
> immediately without re-initializing.

## Signals

| Signal | Type | Description |
| --- | --- | --- |
| `clerk()` | `Clerk` or `null` | the Clerk instance, or `null` until Clerk has loaded |
| `client()` | `ClientResource` or `null` | the current Clerk client resource |
| `session()` | `SignedInSessionResource` or `null` | the active session, or `null` when not signed in |
| `user()` | `UserResource` or `null` | the current user, or `null` when not signed in |
| `organization()` | `OrganizationResource` or `null` | the active organization, or `null` when none is active |
| `isLoaded()` | `boolean` | whether Clerk has finished loading |
| `isSignedIn()` | `boolean` | whether a user is currently signed in |
| `userId()` | `string` or `null` | the current user's ID |
| `orgId()` | `string` or `null` | the active organization's ID |
| `sessionId()` | `string` or `null` | the active session's ID |
| `orgRole()` | `string` or `null` | the current user's role in the active organization |
| `orgSlug()` | `string` or `null` | the active organization's slug |
| `sessionClaims()` | `JwtPayload` or `null` | the claims of the active session's JWT |
| `actor()` | `ActClaim` or `null` | the actor (impersonation) claim of the active session |
| `signIn()` | `SignInResource` or `null` | the active sign-in attempt resource |
| `signUp()` | `SignUpResource` or `null` | the active sign-up attempt resource |
| `sessions()` | `SessionResource[]` | every session registered on the current client device |
| `membership()` | `OrganizationMembershipResource` or `null` | the current user's membership in the active organization |

> `isSignedIn()` is `!!user()?.id` — it does not check session status. A Clerk Core 3 session
> with status `pending` (for example, an incomplete organization-selection task) still reports
> `isSignedIn() === true`, since the pending session already carries a full `user`. This differs
> from upstream SDKs' `useAuth()`, which treats `pending` as signed out by default
> (`treatPendingAsSignedOut`). ngx-clerk has no session-task UI yet, so check
> `session()?.status` yourself if your instance can put users into a pending state.
> The same applies across the whole authorization surface: `has()`, the `*clerkProtect`
> directive, the `canActivateClerk` and `canActivateProtect` guards, and `*clerkSignedIn`
> all treat a pending session as signed in and authorized — a pending session still carries
> `orgId` and `orgRole` claims that `has()` will evaluate. Apps that enable session tasks
> (for example, forced organization selection) should gate on
> `session()?.status === 'active'` themselves until ngx-clerk ships task routing.

```ts
import { Component, inject } from '@angular/core';
import { ClerkService } from 'ngx-clerk';

@Component({ selector: 'app-profile', template: `…` })
export class ProfileComponent {
  protected readonly clerk = inject(ClerkService);
}
```

See [Reading auth state](https://anagstef.github.io/ngx-clerk/reading-auth-state.html) for template examples and the
`toObservable()` interop, and [Organizations & roles](https://anagstef.github.io/ngx-clerk/organizations.html) for the
org-specific signals.

## Reacting to signals with `effect()`

Every signal above is a plain Angular signal, so `effect()` re-runs whenever one it reads
changes — useful for side effects that aren't rendering, like reporting the signed-in user to
an analytics tool:

```ts
import { Component, effect, inject } from '@angular/core';
import { ClerkService } from 'ngx-clerk';

@Component({ selector: 'app-root', template: `…` })
export class AppComponent {
  private readonly clerk = inject(ClerkService);

  constructor() {
    effect(() => {
      const userId = this.clerk.userId();
      if (userId) {
        myAnalytics.identify(userId);
      }
    });
  }
}
```

## Methods

### Authorization & tokens

| Method | Description |
| --- | --- |
| `has(params: CheckAuthorizationParams): boolean` | Checks a role, permission, feature, or plan. `false` while signed out. See [Organizations & roles](https://anagstef.github.io/ngx-clerk/organizations.html). |
| `getToken(options?: GetTokenOptions): Promise<string \| null>` | Returns the current session JWT, optionally for a named template. Resolves to `null` when there's no active session. |
| `setActive(params: SetActiveParams): Promise<void>` | Sets the active session and/or organization. |
| `handleRedirectCallback(params?: HandleOAuthCallbackParams): Promise<void>` | Completes an OAuth/SSO redirect flow. |

```ts
await clerk.setActive({ organization: 'org_123' });
```

### Appearance & localization

| Method | Description |
| --- | --- |
| `updateAppearance(opts: ClerkOptions['appearance']): void` | Updates the global appearance configuration for all Clerk components. |
| `updateLocalization(opts: ClerkOptions['localization']): void` | Updates the localization configuration for all Clerk components. |
| `updateClerkOptions(options: ClerkUpdateOptions): void` | Updates appearance and/or localization together — `ClerkUpdateOptions` is `{ localization?, appearance? }`. |

### Open/close UI

The imperative equivalent of mounting the matching component from
[Components](https://anagstef.github.io/ngx-clerk/components.html) — open one from a click handler instead of always
rendering the component:

| Method | Description |
| --- | --- |
| `openSignIn(opts?: SignInProps): void` / `closeSignIn(): void` | Opens/closes the sign-in modal. |
| `openSignUp(opts?: SignUpProps): void` / `closeSignUp(): void` | Opens/closes the sign-up modal. |
| `openUserProfile(opts?: UserProfileProps): void` / `closeUserProfile(): void` | Opens/closes the user profile modal. |
| `openOrganizationProfile(opts?: OrganizationProfileProps): void` / `closeOrganizationProfile(): void` | Opens/closes the organization profile modal. |
| `openCreateOrganization(opts?: CreateOrganizationProps): void` / `closeCreateOrganization(): void` | Opens/closes the create organization modal. |

### Redirects

| Method | Description |
| --- | --- |
| `redirectToSignIn(opts?: SignInRedirectOptions): void` | Redirects to the Clerk sign-in page. |
| `redirectToSignUp(opts?: SignUpRedirectOptions): void` | Redirects to the Clerk sign-up page. |

### Sign out

| Method | Description |
| --- | --- |
| `signOut(opts?: SignOutOptions): Promise<void>` | Signs out the current user. Pass `sessionId` to sign out of one specific session; omit it to sign out of every session on the device. |

```ts
await clerk.signOut({ redirectUrl: '/' });
```

## Handling errors

`ngx-clerk` re-exports Clerk's error classes and type guards from `@clerk/shared/error`:
`ClerkAPIResponseError`, `ClerkOfflineError`, `ClerkRuntimeError`, `EmailLinkErrorCodeStatus`,
`isClerkAPIResponseError`, `isClerkRuntimeError`, `isEmailLinkError`, `isKnownError`,
`isMetamaskError`.

Methods that call the Clerk API — `setActive()`, `signOut()`, and the sign-in/up flows inside
the mounted components — can reject with a `ClerkAPIResponseError`. Narrow it with
`isClerkAPIResponseError` to read the structured `errors` array:

```ts
import { isClerkAPIResponseError } from 'ngx-clerk';

try {
  await clerk.setActive({ organization: orgId });
} catch (error) {
  if (isClerkAPIResponseError(error)) {
    console.error(error.errors[0]?.longMessage ?? error.errors[0]?.message);
  } else {
    throw error;
  }
}
```

See [Session tokens](https://anagstef.github.io/ngx-clerk/session-tokens.html) for the `ClerkOfflineError` /
`isClerkRuntimeError` pattern specific to `getToken()`.

---

# Migration v0 to v1
> Upgrade an app from ngx-clerk v0.x to v1.
Source: https://anagstef.github.io/ngx-clerk/migration.html

# Migrating from ngx-clerk v0.x to v1.0
{: .no_toc }

<!-- GENERATED from /MIGRATION.md by scripts/generate-llms.mjs — edit that file instead. -->


This guide covers all breaking changes when upgrading from ngx-clerk v0.x (Clerk Core 2 / ClerkJS v5) to v1.0 (Clerk Core 3 / ClerkJS v6).

## Requirements

- **Angular 20+** (v0.x supported Angular 17+)
- **Node.js 20.19+**

## 1. Update the package

```bash
npm install ngx-clerk@1
```

This will also install `@clerk/shared@4.x` automatically. You can remove `@clerk/types` if you had it as a direct dependency -- it's no longer needed.

## 2. Initialization: Replace `__init()` with `provideClerk()`

The manual initialization in your component is replaced by a provider in your app config.

**Before (v0.x):**

```typescript
// app.component.ts
import { ClerkService } from 'ngx-clerk';

@Component({ ... })
export class AppComponent {
  constructor(private clerk: ClerkService) {
    clerk.__init({
      publishableKey: 'pk_test_...',
      afterSignInUrl: '/dashboard',
    });
  }
}
```

**After (v1.0):**

```typescript
// app.config.ts
import { provideClerk } from 'ngx-clerk';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClerk({
      publishableKey: 'pk_test_...',
      signInFallbackRedirectUrl: '/dashboard',
    }),
  ],
};
```

Remove the `__init()` call from your component entirely. Clerk now initializes automatically when the app starts.

## 3. State access: Replace RxJS observables with signals

All state on `ClerkService` is now exposed as Angular signals instead of RxJS `ReplaySubject` streams.

**Before (v0.x):**

```typescript
// Component class
constructor(public clerk: ClerkService) {}

// Template
<div *ngIf="clerk.user$ | async as user">
  Hello {{ user.firstName }}
</div>

// Imperative
clerk.user$.subscribe(user => console.log(user));
```

**After (v1.0):**

```typescript
// Component class
clerk = inject(ClerkService);

// Template
@if (clerk.user(); as user) {
  <p>Hello {{ user.firstName }}</p>
}

// Imperative (in an effect or computed)
effect(() => {
  const user = this.clerk.user();
  console.log(user);
});
```

### Signal reference

| v0.x (RxJS)        | v1.0 (Signal)          |
|---------------------|------------------------|
| `clerk.clerk$`      | `clerk.clerk()`        |
| `clerk.user$`       | `clerk.user()`         |
| `clerk.session$`    | `clerk.session()`      |
| `clerk.client$`     | `clerk.client()`       |
| `clerk.organization$` | `clerk.organization()` |
| n/a                 | `clerk.isLoaded()`     |
| n/a                 | `clerk.isSignedIn()`   |
| n/a                 | `clerk.userId()`       |
| n/a                 | `clerk.orgId()`        |

### If you still need an Observable

Use `toObservable()` from `@angular/core/rxjs-interop`:

```typescript
import { toObservable } from '@angular/core/rxjs-interop';

user$ = toObservable(this.clerk.user);
```

## 4. Auth guard: Replace `ClerkAuthGuardService` with `canActivateClerk`

**Before (v0.x):**

```typescript
import { ClerkAuthGuardService } from 'ngx-clerk';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [ClerkAuthGuardService],
  },
];
```

**After (v1.0):**

```typescript
import { canActivateClerk } from 'ngx-clerk';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [canActivateClerk],
  },
];
```

The new guard also fixes a race condition where the old guard could check auth state before Clerk finished loading.

## 5. Redirect prop renames (Clerk Core 3)

Several redirect-related properties have been renamed in Clerk Core 3. Update them anywhere you pass options to Clerk components or methods.

| v0.x                          | v1.0                            |
|-------------------------------|---------------------------------|
| `afterSignInUrl`              | `signInFallbackRedirectUrl`     |
| `afterSignUpUrl`              | `signUpFallbackRedirectUrl`     |
| `afterSwitchOrganizationUrl`  | `afterSelectOrganizationUrl`    |
| `redirectUrl`                 | `signInFallbackRedirectUrl`     |

For forced redirects (always redirect, ignore the URL the user was trying to visit), use `signInForceRedirectUrl` / `signUpForceRedirectUrl`.

## 6. Type imports

Types are still re-exported from `ngx-clerk`, so your existing imports continue to work:

```typescript
import type { UserResource, SessionResource } from 'ngx-clerk';
```

Under the hood, these now come from `@clerk/shared/types` instead of `@clerk/types`. If you were importing directly from `@clerk/types`, update those imports:

```typescript
// Before
import type { UserResource } from '@clerk/types';

// After
import type { UserResource } from 'ngx-clerk';
// or
import type { UserResource } from '@clerk/shared/types';
```

## 7. New components

v1.0 adds three new components:

```html
<!-- Waitlist -->
<clerk-waitlist [props]="waitlistProps"></clerk-waitlist>

<!-- User Avatar -->
<clerk-user-avatar [props]="avatarProps"></clerk-user-avatar>

<!-- Pricing Table -->
<clerk-pricing-table [props]="pricingProps"></clerk-pricing-table>
```

Import them from `ngx-clerk`:

```typescript
import {
  ClerkWaitlistComponent,
  ClerkUserAvatarComponent,
  ClerkPricingTableComponent,
} from 'ngx-clerk';
```

## 8. Other Clerk Core 3 breaking changes

These are upstream Clerk changes that may affect your app:

- **`client.activeSessions`** is now **`client.sessions`**
- **`strategy: 'saml'`** is now **`strategy: 'enterprise_sso'`**
- **`user.samlAccounts`** is now **`user.enterpriseAccounts`**
- **`hideSlug` prop** on organization components has been removed (manage via Clerk Dashboard)
- **`appearance.layout`** is now **`appearance.options`**
- **`getToken()`** now throws `ClerkOfflineError` when offline (previously returned `null`)

For the full list of Clerk Core 3 changes, see the [official upgrade guide](https://clerk.com/docs/guides/development/upgrading/upgrade-guides/core-3).

## Quick migration checklist

- [ ] Update to Angular 20+ and Node.js 20.19+
- [ ] Install `ngx-clerk@1`
- [ ] Remove `@clerk/types` from your `package.json` if present
- [ ] Replace `__init()` call with `provideClerk()` in `app.config.ts`
- [ ] Replace `clerk.user$` / `| async` with `clerk.user()` signals in templates
- [ ] Replace `ClerkAuthGuardService` with `canActivateClerk` in routes
- [ ] Rename `afterSignInUrl` to `signInFallbackRedirectUrl` (and similar)
- [ ] Update any direct `@clerk/types` imports to `ngx-clerk` or `@clerk/shared/types`
- [ ] Test your auth flows


---

# Use with AI agents
> Point your coding agent at ngx-clerk's LLM-ready docs and skills.
Source: https://anagstef.github.io/ngx-clerk/ai-agents.html

# Use with AI agents

ngx-clerk ships docs and skills designed for AI coding agents.

## LLM-ready docs

- [`llms.txt`](https://anagstef.github.io/ngx-clerk/llms.txt) — index of all documentation pages
- [`llms-full.txt`](https://anagstef.github.io/ngx-clerk/llms-full.txt) — the complete documentation in one file

Paste this into your agent's context or rules file:

    Documentation for ngx-clerk (Clerk SDK for Angular) is available at
    https://anagstef.github.io/ngx-clerk/llms-full.txt — fetch it before
    working with ngx-clerk APIs.

## Agent skills

The repo ships two [agent skills](https://github.com/anagstef/ngx-clerk/tree/main/skills):

- **ngx-clerk-setup** — install and wire ngx-clerk into an Angular app from scratch
- **ngx-clerk-migrate-v0-v1** — upgrade an app from ngx-clerk v0.x to v1

With Claude Code, install them by copying into your project:

    npx degit anagstef/ngx-clerk/skills/ngx-clerk-setup .claude/skills/ngx-clerk-setup

Or simply tell your agent:

    Follow https://raw.githubusercontent.com/anagstef/ngx-clerk/main/skills/ngx-clerk-setup/SKILL.md
    to add Clerk authentication to this app.

## Example prompts

- "Add Clerk authentication to this Angular app using ngx-clerk. Use the setup skill from https://raw.githubusercontent.com/anagstef/ngx-clerk/main/skills/ngx-clerk-setup/SKILL.md"
- "Upgrade this app from ngx-clerk v0 to v1 following https://raw.githubusercontent.com/anagstef/ngx-clerk/main/skills/ngx-clerk-migrate-v0-v1/SKILL.md"

---

# Demo & contributing
> Run the demo, tests, lint, and e2e locally, and how builds, docs, and releases work.
Source: https://anagstef.github.io/ngx-clerk/contributing.html

# Demo & contributing

## Repo layout

- `projects/ngx-clerk` — the library
- `projects/demo` — Angular app used for local development and e2e
- `website/` — this documentation site (Jekyll + just-the-docs)
- `e2e/` — Playwright end-to-end tests
- `skills/` — installable AI agent skills, see [Use with AI agents](https://anagstef.github.io/ngx-clerk/ai-agents.html)

## Node.js version

Building ngx-clerk itself needs **Node 24** — pinned in `.nvmrc` and installed by every CI
job. That's a workspace tooling requirement (Angular CLI, Vite, ESLint), not the Node version
needed to *use* the published package: `ngx-clerk` itself supports **Node 20.19+** in
consuming apps, same as Angular 20 itself.

## Install and run the demo

```bash
pnpm install
pnpm dev
```

`pnpm dev` builds the library and serves `projects/demo` at `http://localhost:4200`. Its
development configuration already ships a Publishable Key for a shared Clerk dev instance, so
there's nothing else to configure.

## Unit tests

```bash
pnpm test
```

Runs the library's unit tests directly with `vitest run` — there's no `ng test` in this
workspace.

## Lint

```bash
pnpm lint
```

## End-to-end tests

Add a Clerk Secret Key from the shared dev instance to `e2e/.env` (gitignored, never
committed):

```text
CLERK_SECRET_KEY=sk_test_XXXX
```

Then run:

```bash
pnpm e2e
```

Playwright's `webServer` config runs `pnpm dev` for you and waits for
`http://localhost:4200` to come up. In CI, the E2E job skips fork pull requests entirely,
since forks don't have access to the `CLERK_SECRET_KEY` secret.

## Build

```bash
pnpm build
```

Builds `projects/ngx-clerk` with ng-packagr into `dist/ngx-clerk`, then copies the root
`README.md` in as the package's own readme — the file at the repo root is what ends up on npm.

## Docs site

This site lives under `website/` and is a Jekyll site using the just-the-docs theme:

```bash
cd website
bundle install
bundle exec jekyll serve
```

Needs Ruby 3.0 or higher. Run `pnpm docs:llms` first if you've changed `MIGRATION.md` or any
page in `website/` — it regenerates `migration.md`, `llms.txt`, and `llms-full.txt` from the
current sources.

## Forward-compatibility smoke test

```bash
pnpm build
scripts/compat-smoke.sh 22
```

Packs the built library and installs it into a fresh app on a newer Angular major, to catch
forward-compatibility breaks early. CI runs this same script against Angular 21 and 22 on
pull requests and pushes to main.

## Release process

Releases run through `semantic-release`, triggered by manually dispatching the "Release"
workflow on `main` — nothing ships automatically on merge. Commit messages must follow
[Conventional Commits](https://www.conventionalcommits.org/); a husky `commit-msg` hook runs
commitlint on every commit to enforce it.
