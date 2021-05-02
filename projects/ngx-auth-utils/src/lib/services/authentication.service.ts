import { Observable, of, ReplaySubject, throwError } from 'rxjs';
import { catchError, concatMap, map, shareReplay, take, tap } from 'rxjs/operators';
import { AuthenticationProvider } from '../providers/authentication.provider';
import { Injectable } from '@angular/core';
import { DynamicStorageProvider, StorageProvider } from '../providers/storage.provider';
import { AccessTokenModel } from '../interfaces';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    private authenticationUser: any | null = null;
    private authenticationState = new ReplaySubject<any | null>(1);
    private authenticatedUserCache?: Observable<any | null>;

    public readonly AUTH_ACCESS_TOKEN = 'ngx-auth-access-token';
    public readonly AUTH_REFRESH_TOKEN = 'ngx-auth-refresh-token';
    public readonly AUTH_METADATA = 'ngx-auth-metadata';

    constructor(private storageProvider: StorageProvider, public authenticationProvider: AuthenticationProvider) {}

    public getAuthenticationState(): Observable<any | null> {
        return this.authenticationState.asObservable();
    }

    public isAuthenticated(): boolean {
        return this.authenticationUser !== null;
    }

    public initialize(): Observable<any | null> {
        if (this.getAccessToken() != null) {
            return this.getAuthenticatedUser(true).pipe(
                take(1),
                catchError(() => of(null))
            );
        }

        this.authenticate(null);
        return of(null);
    }

    public getAuthenticatedUser(force?: boolean): Observable<any | null> {
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

    public login<K>(credentials: K): Observable<any | null> {
        return this.authenticationProvider.doLogin(credentials).pipe(
            tap((authResponse: AccessTokenModel) => {
                if (this.storageProvider instanceof DynamicStorageProvider) {
                    if (!authResponse.dynamicStorage) {
                        throw new Error('No storage type specified on login while using a dynamic storage provider');
                    }
                    this.storageProvider.setType(authResponse.dynamicStorage);
                }

                this.storageProvider.store(this.AUTH_ACCESS_TOKEN, authResponse.accessToken);
                if (authResponse.refreshToken) {
                    this.storageProvider.store(this.AUTH_REFRESH_TOKEN, authResponse.refreshToken);
                }
                if (authResponse.metadata) {
                    this.storageProvider.store(this.AUTH_METADATA, JSON.stringify(authResponse.metadata));
                }
            }),
            concatMap(() => this.getAuthenticatedUser(true))
        );
    }

    public refreshToken(): Observable<string> {
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

    public getAccessToken(): string | null {
        return this.storageProvider.retrieve(this.AUTH_ACCESS_TOKEN);
    }

    public getRefreshToken(): string | null {
        return this.storageProvider.retrieve(this.AUTH_REFRESH_TOKEN);
    }

    public getMetadata(): any | null {
        const meta = this.storageProvider.retrieve(this.AUTH_METADATA);
        if (meta) {
            return JSON.parse(meta);
        }
        return null;
    }

    public logout(): void {
        // TODO: Server logout

        // Removing the token stored in identity service and into the local storage.
        this.authenticate(null);
        this.storageProvider.clear(this.AUTH_ACCESS_TOKEN);
        this.storageProvider.clear(this.AUTH_REFRESH_TOKEN);
    }

    private authenticate(identity: any | null): void {
        this.authenticationUser = identity;
        this.authenticationState.next(this.authenticationUser);
    }
}
