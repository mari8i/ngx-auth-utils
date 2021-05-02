import { Inject, Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, Router, UrlTree } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';
import { NO_AUTH_REDIRECT_URL } from '../config';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
    constructor(
        private authenticationService: AuthenticationService,
        private router: Router,
        @Inject(NO_AUTH_REDIRECT_URL) private noAuthRedirectUrl: string | undefined
    ) {}

    canActivate(): Observable<boolean | UrlTree> {
        return this.checkAuthAndRedirect();
    }

    canActivateChild(): Observable<boolean | UrlTree> {
        return this.checkAuthAndRedirect();
    }

    canLoad(): Observable<boolean> {
        return this.checkAuthentication();
    }

    private checkAuthAndRedirect(): Observable<boolean | UrlTree> {
        return this.checkAuthentication().pipe(
            map((isAuth) => {
                if (!isAuth && this.noAuthRedirectUrl != null) {
                    return this.router.parseUrl(this.noAuthRedirectUrl);
                }
                return isAuth;
            })
        );
    }

    private checkAuthentication(): Observable<boolean> {
        return this.authenticationService.getAuthenticationState().pipe(
            take(1),
            map((user) => user != null)
        );
    }
}
