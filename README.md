# NgxAuthUtils

An Angular library to ease the authentication integration with a backend.

What does it provide?

-   Authentication Service
-   Route Guards
-   Http interceptors
-   Template directives

Currently supports token based authentication with optional refresh token (for JWT authentication)

## Installation

```shell
npm install -D ngx-auth-utils
```

## Setup

Add `NgxAuthUtilsModule.forRoot(conf)` in your `app.module.ts`.

Here is an example:

```typescript
NgxAuthUtilsModule.forRoot({
    authenticationProvider: {
        provide: AuthenticationProvider,
        useClass: MyAuthenticationProvider, // your AuthenticationProvider implementation
        deps: [MyDep1, MyDep2],
    },
    storageProvider: {
        provide: StorageProvider,
        useClass: MyStorageProvider, // your StorageProvider implementation
        deps: [MyStorageDep1],
    },
    homeUrl: '/',
    noAuthRedirectUrl: '/auth/login',
    sessionExpiredRedirectUrl: '/auth/login',
});
```

### Authentication provider

The `AuthenticationProvider` provides an interface with your authentication system the `AuthenticationService`.

Any implementation of this class **must** implement the `fetchUser` and the `doLogin` methods.

#### `doLogin(credentials: unknown): Observable<AccessTokenModel>`

Attempts to login

```typescript
import { AccessTokenModel, AuthenticationProvider } from 'ngx-auth-utils';

export class MyAuthenticationProvider extends AuthenticationProvider {
    constructor(private myService: MyDep1, private myService2: MyDep2) {
        super();
    }

    fetchUser(): Observable<MyUserType> {
        return this.myService.getUser();
    }

    doLogin(credentials: TokenObtainPair): Observable<AccessTokenModel> {
        return this.tokenService.tokenCreate$Json({ body: credentials }).pipe(
            map((tokenPair: TokenLoginResponse) => {
                return {
                    accessToken: tokenPair.access,
                    refreshToken: tokenPair.refresh,
                };
            })
        );
    }

    refreshToken(accessToken: string, refreshToken: string): Observable<AccessTokenModel> {
        return this.tokenService.tokenRefreshCreate$Json({ body: { access: accessToken, refresh: refreshToken } }).pipe(
            map((tokenPair: TokenRefreshResponse) => {
                return {
                    accessToken: tokenPair.access,
                    refreshToken: refreshToken,
                };
            })
        );
    }
}
```

## Docs

### Services

NgxAuthUtils services can be directly injected in your components, directives and services as any other Angular service.

#### AuthenticationService

The `AuthenticationService` provides methods for logging in and out
and maintains the authentication state

##### _Methods_

-   `initialize(): Observable<any | null>`
    Initializes the AuthenticationService. Should be called when initializing
    the angular application (or in your root component `onInit`).
    Performs automatic login if a token is found in the configured storage.
    Emits the user instance if user is authenticated, `null` otherwise.

-   `login<K>(credentials: K): Observable<any | null>`
    Logs in with the given credentials. Emits the user instance if credentials
    are correct, `null` otherwise.

    Internally calls the `doLogin` and `fetchUser` of the configured `AuthenticationProvider`

-   `logout(): void`
    Logs out the authenticated user, removing all authentication
    tokens from the configured storage.

-   `getAuthenticationState(): Observable<any | null>`
    Returns an observable which emits the current user if authenticated, else `null`.

### Guards

Guards can be used to protect your routes

#### AuthGuard

### Directives

#### ngxAuth

```angular2html
<div *ngxAuth>Show only if user is authenticated</div>
<div *ngxAuth="false">Show only if not authenticated</div>
```

#### ngxAuthHas

```angular2html
<!--
  Show contents only if:
  - user is authenticated
  - user has attribute `roles`
  - user attribute `roles` is a list that contain any of 'FOO' and 'BAR'
-->
<div *ngxAuthHas="'roles'; any: ['FOO', 'BAR']">Hello!</div>

<!--

-->
<div *ngxAuthHas="'roles'; all: ['FOO', 'BAR']">FooBar!</div>
<div *ngxAuthHas="'name'; eq: 'foo'">FooBar!</div>
```

## Development

Setup the project:

```shell
   npm install
   npm run prepare
```
