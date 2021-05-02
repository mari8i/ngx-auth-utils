import { Inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';
import { NO_AUTH_REDIRECT_URL } from '../config';
import { Observable } from 'rxjs';

// TODO: tests && canActivateChild && canLoad && canLoadChild
@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    constructor(
        private authenticationService: AuthenticationService,
        private router: Router,
        @Inject(NO_AUTH_REDIRECT_URL) private noAuthRedirectUrl: string | undefined
    ) {}

    canActivate(): Observable<boolean | UrlTree> {
        return this.authenticationService.getAuthenticationState().pipe(
            take(1),
            map((user) => {
                const isAuthenticated = user != null;
                if (this.noAuthRedirectUrl != null && !isAuthenticated) {
                    return this.router.parseUrl(this.noAuthRedirectUrl);
                }
                return isAuthenticated;
            })
        );
    }
}
