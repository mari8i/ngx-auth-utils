import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';
import { StorageProvider } from '../providers/storage.provider';
import { AUTHENTICATION_HEADER, REFRESH_TOKEN, SESSION_EXPIRED_REDIRECT_URL, TOKEN_TYPE } from '../config';

@Injectable()
export class AuthExpiredInterceptor implements HttpInterceptor {
    private handlingRefresh = false;

    constructor(
        private router: Router,
        private storageProvider: StorageProvider,
        private authenticationService: AuthenticationService,
        @Inject(SESSION_EXPIRED_REDIRECT_URL) private sessionExpiredRedirectUrl: string | undefined,
        @Inject(AUTHENTICATION_HEADER)
        private authenticationHeader: string = 'Authorization',
        @Inject(TOKEN_TYPE) private tokenType: string = 'Bearer',
        @Inject(REFRESH_TOKEN) private refreshToken: boolean = false
    ) {}

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return next.handle(request).pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401 && this.authenticationService.hasRefreshToken()) {
                    if (this.refreshToken && !this.handlingRefresh) {
                        this.handlingRefresh = true;
                        return this.authenticationService.refreshToken().pipe(
                            switchMap(() => {
                                this.handlingRefresh = false;
                                return next.handle(request.clone());
                            }),
                            catchError(() => {
                                this.handlingRefresh = false;
                                this.handle401Failure();
                                return throwError(err);
                            })
                        );
                    }

                    this.handle401Failure();
                }
                return throwError(err);
            })
        );
    }

    private handle401Failure(): void {
        this.authenticationService.sessionExpired();

        if (this.sessionExpiredRedirectUrl != null) {
            this.router.navigate([this.sessionExpiredRedirectUrl]);
        }
    }
}
