import { Observable, of, ReplaySubject, throwError } from 'rxjs';
import { catchError, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { AuthenticationProvider } from '../providers/authentication.provider';
import { Injectable } from '@angular/core';
import { StorageProvider } from '../providers/storage.provider';
import { GenericUserObject } from '../types';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    private authenticationUser: GenericUserObject | null = null;
    private authenticationState = new ReplaySubject<GenericUserObject | null>(1);
    private authenticatedUserCache?: Observable<GenericUserObject | null>;

    public readonly AUTH_ACCESS_TOKEN = 'ngx-auth-access-token';
    public readonly AUTH_REFRESH_TOKEN = 'ngx-auth-refresh-token';

    constructor(private storageProvider: StorageProvider, public authenticationProvider: AuthenticationProvider) {}

    public getAuthenticationState(): Observable<GenericUserObject | null> {
        return this.authenticationState.asObservable();
    }

    public isAuthenticated(): boolean {
        return this.authenticationUser !== null;
    }

    public initialize(): Observable<GenericUserObject | null> {
        if (this.getAccessToken() != null) {
            return this.getAuthenticatedUser(true).pipe(
                take(1),
                catchError(() => of(null))
            );
        }

        this.authenticate(null);
        return of(null);
    }

    public getAuthenticatedUser(force?: boolean): Observable<GenericUserObject | null> {
        if (!this.authenticatedUserCache || force || !this.isAuthenticated()) {
            this.authenticatedUserCache = this.authenticationProvider.fetchUser().pipe(
                catchError((error) => {
                    this.logout();
                    return throwError(error);
                }),
                tap((account: GenericUserObject | null) => {
                    this.authenticate(account);
                }),
                shareReplay()
            );
        }
        return this.authenticatedUserCache;
    }

    public login<K>(credentials: K): Observable<GenericUserObject | null> {
        return this.authenticationProvider.doLogin(credentials).pipe(
            tap((authResponse) => {
                this.storageProvider.store(this.AUTH_ACCESS_TOKEN, authResponse.accessToken);
                if (authResponse.refreshToken) {
                    this.storageProvider.store(this.AUTH_REFRESH_TOKEN, authResponse.refreshToken);
                }
            }),
            switchMap(() => this.getAuthenticatedUser(true))
        );
    }

    public refreshToken(): Observable<string> {
        const accessToken = this.getAccessToken();
        const refreshToken = this.getRefreshToken();
        if (!accessToken) {
            throw Error('No accesso token');
        }
        if (!refreshToken) {
            throw Error('No refresh token');
        }
        return this.authenticationProvider.refreshToken(accessToken, refreshToken).pipe(
            tap((newAccessToken) => {
                this.storageProvider.store(this.AUTH_ACCESS_TOKEN, newAccessToken.accessToken);
                this.storageProvider.store(this.AUTH_REFRESH_TOKEN, newAccessToken.refreshToken);
            }),
            map((newAccessToken) => newAccessToken.accessToken)
        );
    }

    public getAccessToken(): string | null {
        return this.storageProvider.retrieve(this.AUTH_ACCESS_TOKEN);
    }

    public getRefreshToken(): string | null {
        return this.storageProvider.retrieve(this.AUTH_REFRESH_TOKEN);
    }

    public logout(): void {
        // TODO: Server logout
        // this.authService.authTokenLogoutCreate().subscribe();

        // Removing the token stored in identity service and into the local storage.
        this.authenticate(null);
        this.storageProvider.clear(this.AUTH_ACCESS_TOKEN);
        this.storageProvider.clear(this.AUTH_REFRESH_TOKEN);
    }

    private authenticate(identity: GenericUserObject | null): void {
        this.authenticationUser = identity;
        this.authenticationState.next(this.authenticationUser);
    }
}
