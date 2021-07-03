import { Directive, Input, OnChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { AuthConditionalDirective } from './auth-conditional.directive';
import { UserConditions } from '../utils/user-conditions';
import { AuthUserType, Condition, UserType } from '../interfaces';

@Directive({
    selector: '[ngxAuthHas]',
})
export class UserHasDirective extends AuthConditionalDirective implements OnChanges {
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

    @Input()
    ngxAuthHasUserCond?: Condition[];

    @Input()
    ngxAuthHasUserCondOp: 'and' | 'or' = 'and';

    @Input()
    ngxAuthHasElse?: TemplateRef<unknown>;

    constructor(authenticationService: AuthenticationService, templateRef: TemplateRef<unknown>, viewContainer: ViewContainerRef) {
        super(authenticationService, templateRef, viewContainer);
    }

    shouldShow(user: UserType): boolean {
        return user != null && this.checkConditions(user) && this.ngxAuthHasCond && this.checkUserConditions(user);
    }

    protected getElseTemplateRef(): TemplateRef<unknown> | undefined {
        return this.ngxAuthHasElse;
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

    ngOnChanges(): void {
        this.updateView();
    }

    private checkUserConditions(user: UserType): boolean {
        if (!this.ngxAuthHasUserCond) {
            return true;
        }

        return UserConditions.evaluateConditions(user, this.ngxAuthHasUserCondOp, this.ngxAuthHasUserCond);
    }
}
