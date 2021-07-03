import { Directive, Input, OnChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { AuthConditionalDirective } from './auth-conditional.directive';
import { UserType } from '../interfaces';

@Directive({
    selector: '[ngxAuth]',
})
export class IsAuthDirective extends AuthConditionalDirective implements OnChanges {
    @Input()
    ngxAuth = true;

    @Input()
    ngxAuthElse?: TemplateRef<unknown>;

    constructor(authenticationService: AuthenticationService, templateRef: TemplateRef<unknown>, viewContainer: ViewContainerRef) {
        super(authenticationService, templateRef, viewContainer);
    }

    shouldShow(user: UserType): boolean {
        return !!user === this.ngxAuth;
    }

    protected getElseTemplateRef(): TemplateRef<unknown> | undefined {
        return this.ngxAuthElse;
    }

    ngOnChanges(): void {
        this.updateView();
    }
}
