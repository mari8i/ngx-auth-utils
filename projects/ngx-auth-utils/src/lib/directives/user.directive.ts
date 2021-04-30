import { Directive, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService } from 'ngx-auth-utils';
import { Subscription } from 'rxjs';

@Directive({
    selector: '[ngxAuthUser]',
    exportAs: 'userRef',
})
export class UserDirective implements OnInit, OnDestroy {
    private authSub?: Subscription;

    private authUser?: unknown;

    public get user(): unknown {
        return this.authUser;
    }

    constructor(private authenticationService: AuthenticationService) {}

    ngOnInit(): void {
        this.authSub = this.authenticationService.getAuthenticationState().subscribe((user) => {
            this.authUser = user;
        });
    }

    ngOnDestroy(): void {
        if (this.authSub) {
            this.authSub.unsubscribe();
        }
    }
}
