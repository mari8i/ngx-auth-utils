import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { ConditionalDirective } from './conditional.directive';

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

    constructor(authenticationService: AuthenticationService, templateRef: TemplateRef<unknown>, viewContainer: ViewContainerRef) {
        super(authenticationService, templateRef, viewContainer);
    }

    shouldShow(user: { [key: string]: unknown }): boolean {
        return user != null && this.checkConditions(user);
    }

    private checkConditions(user: { [key: string]: unknown }): boolean {
        const attrValue: unknown = user[this.ngxAuthHas];

        if (attrValue === undefined) {
            return false;
        }

        if (this.ngxAuthHasAny != null) {
            return this.userHasAnyValues(attrValue as unknown[], this.ngxAuthHasAny);
        }

        if (this.ngxAuthHasAll != null) {
            return this.userHasAllValues(attrValue as unknown[], this.ngxAuthHasAll);
        }

        if (this.ngxAuthHasNone != null) {
            return !this.userHasAnyValues(attrValue as unknown[], this.ngxAuthHasNone);
        }

        if (this.ngxAuthHasEq != null) {
            return this.userHasEqValue(attrValue, this.ngxAuthHasEq);
        }

        if (this.ngxAuthHasNe != null) {
            return !this.userHasEqValue(attrValue, this.ngxAuthHasNe);
        }

        throw Error('Use one of the operators: anyIn, allIn, eq');
    }

    private userHasAllValues(userValues: unknown[], values: unknown[]): boolean {
        return values.every((v) => userValues.includes(v));
    }

    private userHasAnyValues(userValues: unknown[], values: unknown[]): boolean {
        return userValues.some((uv) => values.includes(uv));
    }

    private userHasEqValue(userValue: unknown, userHasEq: unknown): boolean {
        return userValue === userHasEq;
    }
}
