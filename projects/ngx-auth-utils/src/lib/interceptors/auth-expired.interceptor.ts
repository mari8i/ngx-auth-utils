import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';
import { StorageProvider } from '../providers/storage.provider';
import { AUTHENTICATION_HEADER, SESSION_EXPIRED_REDIRECT_URL, TOKEN_TYPE } from '../config';
import { AuthInterceptor } from './auth.interceptor';

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
        @Inject(TOKEN_TYPE) private tokenType: string = 'Bearer'
    ) {}

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return next.handle(request).pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401) {
                    const refreshToken = this.authenticationService.getRefreshToken();
                    if (refreshToken != null && !this.handlingRefresh) {
                        this.handlingRefresh = true;
                        return this.authenticationService.refreshToken().pipe(
                            switchMap((newToken) => {
                                this.handlingRefresh = false;
                                const clonedReq = AuthInterceptor.addHeaderToRequest(
                                    request,
                                    this.authenticationHeader,
                                    this.tokenType,
                                    newToken
                                );
                                return next.handle(clonedReq);
                            }),
                            catchError(() => {
                                this.handlingRefresh = false;
                                this.handle401Failure();
                                return EMPTY;
                            })
                        );
                    }

                    this.handle401Failure();
                    return EMPTY;
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
