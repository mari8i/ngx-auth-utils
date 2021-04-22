import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { ConditionalDirective } from './conditional.directive';

@Directive({
    selector: '[ngxAuth]',
})
export class UserDirective extends ConditionalDirective {
    @Input()
    ngxAuth = true;

    constructor(authenticationService: AuthenticationService, templateRef: TemplateRef<unknown>, viewContainer: ViewContainerRef) {
        super(authenticationService, templateRef, viewContainer);
    }

    shouldShow(user: unknown): boolean {
        return !!user === this.ngxAuth;
    }
}
