import {Inject, Injectable} from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';
import {map} from 'rxjs/operators';
import {AuthenticationService} from '../services/authentication.service';
import {HOME_URL} from '../config';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LoginGuard implements CanActivate {
    constructor(private authenticationService: AuthenticationService, private router: Router, @Inject(HOME_URL) private homeUrl: string) {}

    canActivate(): Observable<boolean | UrlTree> {
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
