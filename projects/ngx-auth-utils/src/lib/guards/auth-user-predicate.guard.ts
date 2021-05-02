import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { map, take } from 'rxjs/operators';
import { UserConditions } from '../utils/user-conditions';
import { AuthUserPredicates } from '../interfaces';
import { GLOBAL_USER_CONDITION_REDIRECT_URL } from '../config';

@Injectable({
    providedIn: 'root',
})
export class AuthUserPredicateGuard implements CanActivate {
    constructor(
        private authenticationService: AuthenticationService,
        private router: Router,
        @Inject(GLOBAL_USER_CONDITION_REDIRECT_URL) private globalRedirectUrl?: string
    ) {}

    /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
        return this.authenticationService.getAuthenticationState().pipe(
            take(1),
            map((user) => {
                if (user != null && this.checkConditions(user, route.data?.authUserPredicate)) {
                    return true;
                }

                const localRedirectRoute = route?.data?.authUserPredicate?.redirectRoute;
                if (localRedirectRoute !== false) {
                    if (localRedirectRoute != null) {
                        return this.router.parseUrl(localRedirectRoute);
                    }

                    if (this.globalRedirectUrl) {
                        return this.router.parseUrl(this.globalRedirectUrl);
                    }
                }

                return false;
            })
        );
    }

    private checkConditions(user: any, unsafePredicates?: AuthUserPredicates): boolean {
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
