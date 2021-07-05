import { OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Subscription } from 'rxjs';
import { UserType } from '../interfaces';

export abstract class AuthConditionalDirective implements OnInit, OnDestroy {
    private showingThenTemplate?: 'then' | 'else';

    private authSub!: Subscription;
    private user: UserType;

    public constructor(
        protected authenticationService: AuthenticationService,
        protected templateRef: TemplateRef<unknown>,
        protected viewContainer: ViewContainerRef
    ) {}

    ngOnInit(): void {
        this.authSub = this.authenticationService.getAuthenticationState().subscribe((user) => {
            this.user = user;
            this.updateView();
        });
    }

    public abstract shouldShow(user: UserType): boolean;

    protected getElseTemplateRef(): TemplateRef<unknown> | undefined {
        return undefined;
    }

    private showTemplate(user: UserType, templateRef: TemplateRef<unknown>): void {
        this.viewContainer.createEmbeddedView(templateRef, { user: user });
    }

    ngOnDestroy(): void {
        if (this.authSub) {
            this.authSub.unsubscribe();
        }
    }

    public updateView(): void {
        this.toggleTemplates(this.user, this.shouldShow(this.user));
    }

    private toggleTemplates(user: UserType, condition: boolean): void {
        if (condition && this.showingThenTemplate !== 'then') {
            this.viewContainer.clear();
            this.showTemplate(user, this.templateRef);
            this.showingThenTemplate = 'then';
        }

        if (!condition && this.showingThenTemplate !== 'else') {
            this.viewContainer.clear();
            const elseTemplate = this.getElseTemplateRef();
            if (elseTemplate) {
                this.showTemplate(user, elseTemplate);
            }
            this.showingThenTemplate = 'else';
        }
    }
}
