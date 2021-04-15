# NgxAuthUtils

An Angular library to ease the authentication integration with a backend.

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

## Development

Setup the project:

```shell
   npm install
   npm run prepare
```
