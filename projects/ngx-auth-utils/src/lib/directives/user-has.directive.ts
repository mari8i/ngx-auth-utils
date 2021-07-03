import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { ConditionalDirective } from './conditional.directive';
import { UserConditions } from '../utils/user-conditions';
import { AuthUserType, UserType } from '../interfaces';

@Directive({
    selector: '[ngxAuthHas]',
})
export class UserHasDirective extends ConditionalDirective {
    @Input()
    ngxAuthHas = '';

    @Input()
    ngxAuthHasAny?: string[];

    @Input()
    ngxAuthHasAll?: string[];

    @Input()
    ngxAuthHasEq?: string;

    @Input()
    ngxAuthHasNe?: string;

    @Input()
    ngxAuthHasNone?: string[];

    @Input()
    ngxAuthHasCond = true;

    constructor(authenticationService: AuthenticationService, templateRef: TemplateRef<unknown>, viewContainer: ViewContainerRef) {
        super(authenticationService, templateRef, viewContainer);
    }

    shouldShow(user: UserType): boolean {
        return user != null && this.checkConditions(user) && this.ngxAuthHasCond;
    }

    private checkConditions(user: AuthUserType): boolean {
        const attrValue: unknown = user[this.ngxAuthHas];

        if (attrValue === undefined) {
            return false;
        }

        if (this.ngxAuthHasAny != null) {
            return UserConditions.hasAnyValues(attrValue as unknown[], this.ngxAuthHasAny);
        }

        if (this.ngxAuthHasAll != null) {
            return UserConditions.hasAllValues(attrValue as unknown[], this.ngxAuthHasAll);
        }

        if (this.ngxAuthHasNone != null) {
            return UserConditions.hasNoneOfTheValues(attrValue as unknown[], this.ngxAuthHasNone);
        }

        if (this.ngxAuthHasEq != null) {
            return UserConditions.hasEqValue(attrValue as unknown[], this.ngxAuthHasEq);
        }

        if (this.ngxAuthHasNe != null) {
            return UserConditions.hasNeValue(attrValue as unknown[], this.ngxAuthHasNe);
        }

        throw Error('Use one of the operators: anyIn, allIn, eq');
    }
}
