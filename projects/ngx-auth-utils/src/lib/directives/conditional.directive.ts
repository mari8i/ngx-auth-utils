import { OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Subscription } from 'rxjs';
import { UserType } from '../interfaces';

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
                this.show(user);
            } else {
                this.hide();
            }
        });
    }

    public abstract shouldShow(user: UserType): boolean;

    private show(user: UserType): void {
        if (!this.hasView) {
            this.viewContainer.createEmbeddedView(this.templateRef, { user: user });
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
