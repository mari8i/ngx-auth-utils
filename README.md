# NgxAuthUtils

An Angular library to ease the authentication integration with a backend.

Currently supports token based authentication with optional refresh token (for JWT authentication).

**What does it provide?**

-   Authentication Service
-   Route Guards
-   Http interceptors
-   Template directives

**Is it ready to use?**

The library is in an early development stage and is currently used in one single project,
but is well-tested and all implemented features work.

_Please keep in mind that it might still change a lot._

Feel free to try it out and suggest a feature or contribute yourself if you feel that something is wrong or missing.

**Is it safe to use?**

While the library itself is safe, what can lead to security problems is how you use it and
how your authentication system works.

It does not store user credentials, of course, but it does store the authentication tokens in the specified storage.

Please read some token authentication security articles about the implications of storing authentication tokens in the local storage and the session storage.

As usual, not storing anything is the safest choice, but usually also not the best for the user's experience.

## Installation

```shell
npm install -D ngx-auth-utils
```

## Setup

1. Add `NgxAuthUtilsModule.forRoot(config: NgxAuthUtilsConfig)` in your `app.module.ts` NgModule imports.

    ```typescript
    NgxAuthUtilsModule.forRoot({
        // Provide to the library your AuthenticationProvider implementation to authenticated agains your APIs.
        authenticationProvider: {
            provide: AuthenticationProvider,
            useClass: MyAuthenticationProvider,
            deps: [MyDep1, MyDep2],
        },

        // Optional: Tells the library where to store data.
        // Can be one of MemoryStorageProvider, LocalStorageProvider, SessionStorageProvider and DynamicStorageProvider
        // Or your own implementaion of the StorageProvider abstract class.
        // If not provided, defaults to MemoryStorageProvider.
        storageProvider: {
            provide: StorageProvider,
            useClass: LocalStorageProvider,
        },

        // Optional: If set, the LoginGuard redirect to this url when user is authenticated
        homeUrl: '/',

        // Optional: If set, the AuthGuard redirects to this url when user is not authenticated
        noAuthRedirectUrl: '/auth/login',

        // Optional: If set, the http-interceptor will redirecto to this url when session is expired
        sessionExpiredRedirectUrl: '/auth/login',

        // Optional: the header used for the authentication key. Defaults to 'Authorization'
        authenticationHeader: 'Authorization',

        // Optional: The token type.
        // Can be one of 'Token' and 'Bearer'.
        // Defaults to 'Bearer'
        tokenType: 'Bearer',
    });
    ```

2. Initialize the `AuthenticationService` in your root component:

    ```typescript
    @Component({
        selector: 'app-root',
        templateUrl: './app.component.html',
        styleUrls: ['./app.component.scss'],
    })
    export class AppComponent {
        constructor(private authenticationService: AuthenticationService) {
            this.authenticationService.initialize().subscribe();
        }
    }
    ```

    ... or in the angular `APP_INITIALIZER` in your root module:

    ```typescript
    export function initializeApp(authService: AuthenticationService) {
        return (): Promise<void> => {
            return new Promise<void>((resolve) => {
                authService.initialize().subscribe();
                resolve();
            });
        };
    }

    // Add the APP_INITIALIZIER provider
    providers: [{ provide: APP_INITIALIZER, useFactory: initializeApp, deps: [AuthenticationService], multi: true }];
    ```

3. Provide your authentication provider implementation:

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

        /**
           Mandatory: Fetch the user identity 
         */
        fetchUser(): Observable<MyUserType> {
            return this.myService.getUser();
        }

        /**
         * Mandatory: Attempts to login with the given credentials
         * @param credentials
         */
        doLogin(credentials: MyCredentials): Observable<AccessTokenModel> {
            return this.myService2.authenticate({ body: credentials }).pipe(
                map((loginResponse: MyLoginResponse) => {
                    return {
                        accessToken: loginResponse.access,
                        refreshToken: loginResponse.refresh,
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

4. Use the `AuthenticationService` to login your users!

    ```typescript
        login(): void {
            this.authenticationService
                .login(this.loginForm.getRawValue())
                .subscribe((user) => {
                    console.log('The user is logged in!', user);
                    this.router.navigate(['/home']);
                });
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

### Storage providers

NgxAuthUtils provides 4 storage providers that the library uses to store the authentication tokens and some other data.

> The buit-in providers don't suite your needs? Simply extend the StorageProvider abstract class and
> use your class in the configuration.

**MemoryStorageProvider**: Stores all data in memory. No persistence at all.

**LocalStorageProvider**: Stores all data in the `localStorage`.

**SessionStorageProvider**: Stores all data in the `sessionStorage`.

**DynamicStorageProvider**: Let's you choose the provider at runtime, more specifically when the user logs in.

This might be useful if you want to implement a "remember-me" functionality and want to store the authentication
data either in the local or session storage based on the user's choice.

Configure the library to use the `DynamicStorageProvider`:

```typescript
    storageProvider: {
        provide: StorageProvider,
        useClass: DynamicStorageProvider
    }
```

In your `AuthenticationProvider` implementation, make sure that the `doLogin` function returns the storage to use:

```typescript
    doLogin(credentials: UserLoginModel): Observable<AccessTokenModel> {
        return this.tokenService.tokenCreate$Json({ body: credentials }).pipe(
            map((tokenPair: TokenLoginResponse) => {
                return {
                    accessToken: tokenPair.access,
                    refreshToken: tokenPair.refresh,
                    dynamicStorage: credentials.rememberMe ? 'session' : 'local'
                };
            })
        );
    }
```

### Guards

Guards can be used to protect your routes

#### AuthGuard

The `AuthGuard` is a `CanActivate` guard that allows routes to be loaded only if the user is authenticated.

If the user is not authenticated instead:

-   If the `noAuthRedirectUrl` setting has been set, it redirects to the given URL (usually, the login page)
-   If `noAuthRedirectUrl` has not been set, it simply denies the route to be loaded.

Here is an example:

```typescript
const routes: Routes = [
    {
        path: 'auth',
        loadChildren: (() => import('./modules/auth/auth.module').then((m) => m.AuthModule)) as LoadChildren,
        canActivate: [LoginGuard],
    },
];
```

### LoginGuard

The `LoginGuard` does exactly the opposite of the `AuthGuard`. It allows the routes to be loaded only
if the user is **not** authenticated.

Use this if for example you don't want that a logged user might navigate to the login page.

If the user is authenticated, the guard acts similarly to the `AuthGuard`:

-   If the `homeUrl` setting has been set, it redirects to the given URL (usually, the user's homepage)
-   If `homeUrl` has not been set, it simply denies the route to be loaded.

Here is an example:

```typescript
const routes: Routes = [
    {
        path: 'home',
        loadChildren: (() => import('./modules/home/home.module').then((m) => m.HomeModule)) as LoadChildren,
        canActivate: [AuthGuard],
    },
];
```

### Directives

#### ngxAuth

The `ngxAuth` directive is a structural directive that conditionally includes a template based on the authentication state.

```angular2html
<div *ngxAuth>Show only if user is authenticated</div>
<div *ngxAuth="false">Show only if not authenticated</div>
```

The directive also exports the authenticated user, so it can be used in the template:

```angular2html
<div *ngxAuth="true; user as u">User email is: {{ u.email }}</div>
```

#### ngxAuthHas

The `ngxAuthHas` directive, similarly to the `ngxAuth` directive, conditionally includes a template
based on a condition over an attribute of the authenticated user.

> The `ngxAuthHas` directive never includes the template if the user is not authenticated.

Let's assume your user model looks like this:

```typescript
export interface User {
    name: string;
    email: string;
    groups: string[];
}
```

You can use the directive to predicate over it's attributes.

```angular2html
<div *ngxAuthHas="'groups'; any: ['FOO', 'BAR']; user as u">User {{ u.name }} is in groups FOO and BAR </div>
```

As you can see, just like the `ngxAuth` directive, the user instance is exported so it
can be used directly in the template.

**Attribute is equal**

```angular2html
<div *ngxAuthHas="'name'; eq: 'foo'">User's name is foo!</div>
```

**Attribute is not equal**

```angular2html
<div *ngxAuthHas="'name'; ne: 'foo'">User's name is NOT foo!</div>
```

**List attribute contains any value**

```angular2html
<div *ngxAuthHas="'groups'; any: ['FOO', 'BAR']">User has at least one of the the two groups</div>
```

**List attribute contains all values**

```angular2html
<div *ngxAuthHas="'groups'; all: ['FOO', 'BAR']">User is both in groups FOO and BAR</div>
```

**List attribute contains none of the values**

```angular2html
<div *ngxAuthHas="'groups'; none: ['FOO', 'BAR']">User is neither in group FOO and group BAR</div>
```

### ngxAuthUser

The `ngxAuthUser` directive provides the authenticated user instance directly in your templates:

```angular2html
<div ngxAuthUser #authUser="userRef">
    User's name is: {{ authUser.user?.name }}
</div>
```

> If the user is not authenticated, the `user` reference of the directive will be simply `null`.

## Development & Contribution

Setup the project:

```shell
   npm install
   npm run prepare
```

If you want to contribute, please contact me before so we can discuss about it.
Then simply do your modifications, add tests to them, and simply submit a change request.
