import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { Observable } from 'rxjs';
import { AuthenticationEvent, UserType } from '../interfaces';

@Injectable({
    providedIn: 'root',
})
export class NgxAuthService {
    /**
     * Emits the authentication state, which can be either:
     * - null if user is not authenticated
     * - An object representing the user instance if authenticated
     */
    public get state(): Observable<UserType> {
        return this.libAuthService.getAuthenticationState();
    }

    /**
     * Emits authentication events. Events can be:
     * - initialized: The NgxAuthService has been initialized
     * - login: The user logged in
     * - logout: The user logged out
     * - login-failed: A wrong login attempt was made
     * - session-expired: The authenticated user session expired
     */
    public get events(): Observable<AuthenticationEvent> {
        return this.libAuthService.getAuthenticationEvents();
    }

    constructor(private libAuthService: AuthenticationService) {}

    /**
     * Initializes the NgxAuthenticationService.
     * If configured and any authentication tokens are found it the storage, attempts auto-login.
     */
    public initialize(): Observable<UserType> {
        return this.libAuthService.initialize();
    }

    /**
     * Refreshes the authenticated user object instance and emits it.
     *
     * For example, this can be used for refreshing the user
     * instance when his profile is updated and some attributes
     * require to be updated
     */
    public refreshUser(): Observable<UserType> {
        return this.libAuthService.getAuthenticatedUser(true);
    }

    /**
     * Attempts to login the user with the given credentials
     *
     * @param credentials: The credentials required by your authentication implementation
     */
    public login<K>(credentials: K): Observable<UserType> {
        return this.libAuthService.login(credentials);
    }

    /**
     * Logs the user out. Clears the authentication state and all associated storage data
     */
    public logout(): void {
        this.libAuthService.logout();
    }
}
