import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { take } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class UserResolver implements Resolve<unknown> {
    constructor(private authenticationService: AuthenticationService) {}

    resolve(): Observable<unknown> {
        return this.authenticationService.getAuthenticationState().pipe(take(1));
    }
}
