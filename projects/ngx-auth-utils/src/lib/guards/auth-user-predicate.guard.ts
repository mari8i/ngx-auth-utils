import { Inject, Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    CanActivateChild,
    CanLoad,
    Route,
    Router,
    RouterStateSnapshot,
    UrlSegment,
    UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { map, take } from 'rxjs/operators';
import { UserConditions } from '../utils/user-conditions';
import { AuthUserPredicates } from '../interfaces';
import { GLOBAL_USER_CONDITION_REDIRECT_URL } from '../config';

@Injectable({
    providedIn: 'root',
})
export class AuthUserPredicateGuard implements CanActivate, CanActivateChild, CanLoad {
    constructor(
        private authenticationService: AuthenticationService,
        private router: Router,
        @Inject(GLOBAL_USER_CONDITION_REDIRECT_URL) private globalRedirectUrl?: string
    ) {}

    /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
    canLoad(route: Route, segments: UrlSegment[]): Observable<boolean | UrlTree> {
        return this.checkConditions(route);
    }

    /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
        return this.checkConditionsAndRedirect(childRoute, state);
    }

    /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
        return this.checkConditionsAndRedirect(route, state);
    }

    private checkConditionsAndRedirect(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
        return this.checkConditions(route, state).pipe(
            map((result) => {
                if (!result) {
                    const localRedirectRoute = route?.data?.authUserPredicate?.redirectRoute;
                    if (localRedirectRoute !== false) {
                        if (localRedirectRoute != null) {
                            return this.router.parseUrl(localRedirectRoute);
                        }

                        if (this.globalRedirectUrl) {
                            return this.router.parseUrl(this.globalRedirectUrl);
                        }
                    }
                }

                return result;
            })
        );
    }

    private checkConditions(route: ActivatedRouteSnapshot | Route, state?: RouterStateSnapshot): Observable<boolean> {
        return this.authenticationService.getAuthenticationState().pipe(
            take(1),
            map((user) => {
                const conditionsValid = user != null && this.checkPredicatesAgainstUser(user, route.data?.authUserPredicate);
                if (!conditionsValid) {
                    this.authenticationService.notifyGuardBlockedAccess('AuthUserPredicateGuard', route, state);
                }
                return conditionsValid;
            })
        );
    }

    private checkPredicatesAgainstUser(user: any, unsafePredicates?: AuthUserPredicates): boolean {
        const predicates = this.validatePredicates(unsafePredicates);

        if (!(predicates.attribute in user)) {
            console.warn(`AuthUserPredicateGuard: User has no attribute '${predicates.attribute}', returning false`);
            return false;
        }

        const attrValue = user[predicates.attribute];
        switch (predicates.condition) {
            case 'all':
                return UserConditions.hasAllValues(attrValue, predicates.value);
            case 'any':
                return UserConditions.hasAnyValues(attrValue, predicates.value);
            case 'none':
                return UserConditions.hasNoneOfTheValues(attrValue, predicates.value);
            case 'eq':
                return UserConditions.hasEqValue(attrValue, predicates.value);
            case 'ne':
                return UserConditions.hasNeValue(attrValue, predicates.value);
        }
    }

    private validatePredicates(predicates: AuthUserPredicates | undefined): AuthUserPredicates {
        if (!predicates) {
            throw Error('AuthUserPredicate guard missing parameters');
        }

        if (!predicates.condition) {
            throw Error('AuthUserPredicate guard missing condition');
        }

        if (!predicates.attribute) {
            throw Error('AuthUserPredicate guard missing attribute');
        }

        return predicates;
    }
}
