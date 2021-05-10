import { Observable, of, ReplaySubject, Subject, throwError } from 'rxjs';
import { catchError, concatMap, map, shareReplay, take, tap } from 'rxjs/operators';
import { AuthenticationProvider } from '../providers/authentication.provider';
import { Injectable } from '@angular/core';
import { DynamicStorageProvider, StorageProvider } from '../providers/storage.provider';
import { AccessTokenModel, AuthenticationEvent, UserType } from '../interfaces';
import { ActivatedRouteSnapshot, Route, RouterStateSnapshot } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    private authenticationUser: UserType = null;
    private authenticationState$ = new ReplaySubject<UserType>(1);
    private authenticatedUserCache?: Observable<UserType>;
    private events$ = new Subject<AuthenticationEvent>();

    // TODO: Make configurable
    public readonly AUTH_IS_AUTHENTICATED = 'ngx-auth-is-authenticated';
    public readonly AUTH_ACCESS_TOKEN = 'ngx-auth-access-token';
    public readonly AUTH_REFRESH_TOKEN = 'ngx-auth-refresh-token';
    public readonly AUTH_METADATA = 'ngx-auth-metadata';

    constructor(private storageProvider: StorageProvider, public authenticationProvider: AuthenticationProvider) {}

    public getAuthenticationState(): Observable<UserType> {
        return this.authenticationState$.asObservable();
    }

    public getAuthenticationEvents(): Observable<AuthenticationEvent> {
        return this.events$.asObservable();
    }

    public isAuthenticated(): boolean {
        return this.authenticationUser !== null;
    }

    public initialize(): Observable<UserType> {
        return this.doInitialize().pipe(tap((user) => this.events$.next(new AuthenticationEvent('initialized', user))));
    }

    public getAuthenticatedUser(force?: boolean): Observable<UserType> {
        if (!this.authenticatedUserCache || force || !this.isAuthenticated()) {
            this.authenticatedUserCache = this.authenticationProvider.fetchUser().pipe(
                catchError((error) => {
                    this.logout();
                    return throwError(error);
                }),
                tap((account: any | null) => {
                    this.authenticate(account);
                }),
                shareReplay()
            );
        }
        return this.authenticatedUserCache;
    }

    public login<K>(credentials: K): Observable<UserType> {
        return this.authenticationProvider.doLogin(credentials).pipe(
            tap((authResponse: AccessTokenModel) => {
                if (this.storageProvider instanceof DynamicStorageProvider) {
                    if (!authResponse.dynamicStorage) {
                        throw new Error('No storage type specified on login while using a dynamic storage provider');
                    }
                    this.storageProvider.setType(authResponse.dynamicStorage);
                }

                this.storageProvider.store(this.AUTH_IS_AUTHENTICATED, JSON.stringify(new Date()));
                this.storageProvider.store(this.AUTH_ACCESS_TOKEN, authResponse.accessToken);

                if (authResponse.refreshToken) {
                    this.storageProvider.store(this.AUTH_REFRESH_TOKEN, authResponse.refreshToken);
                }
                if (authResponse.metadata) {
                    this.storageProvider.store(this.AUTH_METADATA, JSON.stringify(authResponse.metadata));
                }
            }),
            concatMap(() => this.getAuthenticatedUser(true)),
            catchError((error) => {
                this.events$.next(new AuthenticationEvent('login-failed', null));
                return throwError(error);
            }),
            tap((user) => this.events$.next(new AuthenticationEvent('login', user)))
        );
    }

    public refreshToken(): Observable<string | undefined> {
        const accessToken = this.getAccessToken();
        const refreshToken = this.getRefreshToken();
        const metadata = this.getMetadata();
        if (!accessToken) {
            throw Error('No access token');
        }
        if (!refreshToken) {
            throw Error('No refresh token');
        }
        return this.authenticationProvider.refreshToken(accessToken, refreshToken, metadata).pipe(
            tap((newAccessToken) => {
                this.storageProvider.store(this.AUTH_ACCESS_TOKEN, newAccessToken.accessToken);
                this.storageProvider.store(this.AUTH_REFRESH_TOKEN, newAccessToken.refreshToken);
                this.storageProvider.store(this.AUTH_METADATA, JSON.stringify(newAccessToken.metadata));
            }),
            map((newAccessToken) => newAccessToken.accessToken)
        );
    }

    hasStorageAuthenticationData(): boolean {
        return this.storageProvider.retrieve(this.AUTH_IS_AUTHENTICATED) != null;
    }

    getAccessToken(): string | null {
        return this.storageProvider.retrieve(this.AUTH_ACCESS_TOKEN);
    }

    getRefreshToken(): string | null {
        return this.storageProvider.retrieve(this.AUTH_REFRESH_TOKEN);
    }

    private getMetadata(): any | null {
        const meta = this.storageProvider.retrieve(this.AUTH_METADATA);
        if (meta) {
            return JSON.parse(meta);
        }
        return null;
    }

    sessionExpired(): void {
        const user = this.authenticationUser;
        this.doLogout();
        this.events$.next(new AuthenticationEvent('session-expired', user));
    }

    public logout(): void {
        // TODO: Server logout
        const user = this.authenticationUser;
        this.doLogout();
        this.events$.next(new AuthenticationEvent('logout', user));
    }

    private doLogout(): void {
        this.authenticate(null);
        this.storageProvider.clear(this.AUTH_ACCESS_TOKEN);
        this.storageProvider.clear(this.AUTH_REFRESH_TOKEN);
        this.storageProvider.clear(this.AUTH_METADATA);
        this.storageProvider.clear(this.AUTH_IS_AUTHENTICATED);
    }

    private authenticate(identity: UserType): void {
        this.authenticationUser = identity;
        this.authenticationState$.next(this.authenticationUser);
    }

    private doInitialize(): Observable<UserType> {
        if (this.hasStorageAuthenticationData()) {
            return this.getAuthenticatedUser(true).pipe(
                take(1),
                catchError(() => of(null))
            );
        }

        this.authenticate(null);
        return of(null);
    }

    notifyGuardBlockedAccess(guardName: string, route?: ActivatedRouteSnapshot | Route, state?: RouterStateSnapshot): void {
        this.events$.next(new AuthenticationEvent('guard-blocked-access', this.authenticationUser, { guardName, route, state }));
    }
}
