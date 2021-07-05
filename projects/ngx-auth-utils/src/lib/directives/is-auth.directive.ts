import { Directive, Input, OnChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthConditionalDirective } from './auth-conditional.directive';
import { UserType } from '../interfaces';
import { NgxAuthService } from '../services/ngx-auth.service';

@Directive({
    selector: '[ngxAuth]',
})
export class IsAuthDirective extends AuthConditionalDirective implements OnChanges {
    @Input()
    ngxAuth = true;

    @Input()
    ngxAuthElse?: TemplateRef<unknown>;

    constructor(authenticationService: NgxAuthService, templateRef: TemplateRef<unknown>, viewContainer: ViewContainerRef) {
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
