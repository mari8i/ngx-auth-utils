import { Inject, Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    CanActivateChild,
    CanLoad,
    CanMatch,
    Route,
    Router,
    RouterStateSnapshot,
    UrlTree,
} from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';
import { NO_AUTH_REDIRECT_URL } from '../config';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthUserGuard implements CanActivate, CanActivateChild, CanLoad, CanMatch {
    constructor(
        private authenticationService: AuthenticationService,
        private router: Router,
        @Inject(NO_AUTH_REDIRECT_URL) private noAuthRedirectUrl: string | undefined
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
        return this.checkAuthAndRedirect(route, state);
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
        return this.checkAuthAndRedirect(route, state);
    }

    canLoad(): Observable<boolean> {
        return this.checkAuthentication();
    }

    canMatch(): Observable<boolean> {
        return this.checkAuthentication();
    }

    private checkAuthAndRedirect(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
        return this.checkAuthentication(route, state).pipe(
            map((isAuth) => {
                if (!isAuth && this.noAuthRedirectUrl != null) {
                    return this.router.parseUrl(this.noAuthRedirectUrl);
                }
                return isAuth;
            })
        );
    }

    private checkAuthentication(route?: ActivatedRouteSnapshot | Route, state?: RouterStateSnapshot): Observable<boolean> {
        return this.authenticationService.getAuthenticationState().pipe(
            take(1),
            map((user) => {
                if (user == null) {
                    this.authenticationService.notifyGuardBlockedAccess('AuthUserGuard', route, state);
                    return false;
                }
                return true;
            })
        );
    }
}
