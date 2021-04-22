import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Subscription } from 'rxjs';

@Directive({
    selector: '[ngxAuth]',
})
export class UserDirective implements OnInit, OnDestroy {
    @Input()
    ngxAuth = true;

    private hasView = false;

    private authSub!: Subscription;

    constructor(
        private authenticationService: AuthenticationService,
        private templateRef: TemplateRef<unknown>,
        private viewContainer: ViewContainerRef
    ) {}

    ngOnInit(): void {
        this.authSub = this.authenticationService.getAuthenticationState().subscribe((user) => {
            if (!!user === this.ngxAuth) {
                this.show();
            } else {
                this.hide();
            }
        });
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
