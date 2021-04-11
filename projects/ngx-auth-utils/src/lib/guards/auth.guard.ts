import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';
import { NO_AUTH_REDIRECT_URL } from '../config';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    constructor(
        private authenticationService: AuthenticationService,
        private router: Router,
        @Inject(NO_AUTH_REDIRECT_URL) private noAuthRedirectUrl: string | undefined
    ) {}

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
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
