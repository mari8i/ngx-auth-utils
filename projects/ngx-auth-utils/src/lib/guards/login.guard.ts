import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';
import { HOME_URL } from '../config';

@Injectable({
    providedIn: 'root',
})
export class LoginGuard implements CanActivate {
    constructor(private authenticationService: AuthenticationService, private router: Router, @Inject(HOME_URL) private homeUrl: string) {}

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
        return this.authenticationService.getAuthenticationState().pipe(
            map((identity) => {
                if (identity != null) {
                    return this.router.parseUrl(this.homeUrl);
                }
                return true;
            })
        );
    }
}
