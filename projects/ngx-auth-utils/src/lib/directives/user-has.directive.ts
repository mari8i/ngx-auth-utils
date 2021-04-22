import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Subscription } from 'rxjs';

@Directive({
    selector: '[ngxAuthHas]',
})
export class UserHasDirective implements OnInit, OnDestroy {
    @Input()
    ngxAuthHas = '';

    @Input()
    ngxAuthHasAny?: string[];

    @Input()
    ngxAuthHasAll?: string[];

    @Input()
    ngxAuthHasEq?: string;

    private hasView = false;

    private authSub!: Subscription;

    constructor(
        private authenticationService: AuthenticationService,
        private templateRef: TemplateRef<unknown>,
        private viewContainer: ViewContainerRef
    ) {}

    ngOnInit(): void {
        this.authSub = this.authenticationService.getAuthenticationState().subscribe((user) => {
            if (user && this.checkConditions(user)) {
                this.show();
            } else {
                this.hide();
            }
        });
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

        if (this.ngxAuthHasEq != null) {
            return this.userHasEqValue(attrValue, this.ngxAuthHasEq);
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

    private show(): void {
        if (!this.hasView) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.hasView = true;
        }
    }

    private hide(): void {
        if (this.hasView) {
            this.viewContainer.clear();
            this.hasView = false;
        }
    }

    ngOnDestroy(): void {
        if (this.authSub) {
            this.authSub.unsubscribe();
        }
    }
}
