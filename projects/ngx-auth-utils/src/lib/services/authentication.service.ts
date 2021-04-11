import {Observable, of, ReplaySubject} from 'rxjs';
import {catchError, shareReplay, switchMap, take, tap} from 'rxjs/operators';
import {AuthenticationProvider} from '../providers/authentication.provider';
import {Injectable} from '@angular/core';
import {StorageProvider} from '../providers/storage.provider';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authenticationUser: any | null = null;
  private authenticationState = new ReplaySubject<any | null>(1);
  private authenticatedUserCache?: Observable<any | null>;

  private readonly AUTH_ACCESS_TOKEN = 'ngx-auth-access-token';
  private readonly AUTH_REFRESH_TOKEN = 'ngx-auth-refresh-token';

  constructor(
    private storageProvider: StorageProvider,
    public authenticationProvider: AuthenticationProvider
  ) {}

  public getAuthenticationState(): Observable<any | null> {
    return this.authenticationState.asObservable();
  }

  public isAuthenticated(): boolean {
    return this.authenticationUser !== null;
  }

  public initialize(): void {
    if (this.getAccessToken() != null) {
      this.getAuthenticatedUser(true).pipe(take(1)).subscribe();
    }
  }

  public getAuthenticatedUser(force?: boolean): Observable<any | null> {
    if (!this.authenticatedUserCache || force || !this.isAuthenticated()) {
      this.authenticatedUserCache = this.authenticationProvider
        .fetchUser()
        .pipe(
          catchError(() => {
            return of(null);
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
      tap((authResponse) => {
        this.storageProvider.store(
          this.AUTH_ACCESS_TOKEN,
          authResponse.accessToken
        );
        if (authResponse.refreshToken) {
          this.storageProvider.store(
            this.AUTH_REFRESH_TOKEN,
            authResponse.refreshToken
          );
        }
      }),
      switchMap(() => this.getAuthenticatedUser(true))
    );
  }

  public getAccessToken(): string | null{
    return this.storageProvider.retrieve(this.AUTH_ACCESS_TOKEN);
  }

  public getRefreshToken(): string | null{
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

  private authenticate(identity: any | null): void {
    this.authenticationUser = identity;
    this.authenticationState.next(this.authenticationUser);
  }
}
