import { OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Subscription } from 'rxjs';

export abstract class ConditionalDirective implements OnInit, OnDestroy {
    private hasView = false;

    private authSub!: Subscription;

    protected constructor(
        protected authenticationService: AuthenticationService,
        protected templateRef: TemplateRef<unknown>,
        protected viewContainer: ViewContainerRef
    ) {}

    ngOnInit(): void {
        this.authSub = this.authenticationService.getAuthenticationState().subscribe((user) => {
            if (this.shouldShow(user)) {
                this.show();
            } else {
                this.hide();
            }
        });
    }

    public abstract shouldShow(user: unknown): boolean;

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
