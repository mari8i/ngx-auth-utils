import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';
import { StorageProvider } from '../providers/storage.provider';
import { REFRESH_TOKEN, SESSION_EXPIRED_REDIRECT_URL, UNAUTHORIZED_URL_BLACKLIST } from '../config';

@Injectable()
export class AuthExpiredInterceptor implements HttpInterceptor {
    private refreshTokenSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private handlingRefresh = false;

    constructor(
        private router: Router,
        private storageProvider: StorageProvider,
        private authenticationService: AuthenticationService,
        @Inject(SESSION_EXPIRED_REDIRECT_URL) private sessionExpiredRedirectUrl: string | undefined,
        @Inject(REFRESH_TOKEN) private refreshToken: boolean = false,
        @Inject(UNAUTHORIZED_URL_BLACKLIST) private unauthorizedUrlBlacklist: string[]
    ) {}

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return next.handle(request).pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401) {
                    if (this.authenticationService.hasRefreshToken() && this.refreshToken && !this.isUrlInBlacklist(request.url)) {
                        return this.handleTokenRefresh(next, request, err);
                    }
                    this.handle401Failure();
                }

                return throwError(err);
            })
        );
    }

    private handleTokenRefresh(next: HttpHandler, request: HttpRequest<unknown>, err: HttpErrorResponse): Observable<HttpEvent<any>> {
        if (this.handlingRefresh) {
            return this.refreshTokenSubject.pipe(
                filter((result) => result),
                take(1),
                switchMap(() => next.handle(request.clone()))
            );
        }

        this.handlingRefresh = true;
        this.refreshTokenSubject.next(false);

        return this.authenticationService.refreshToken().pipe(
            switchMap(() => {
                this.handlingRefresh = false;
                this.refreshTokenSubject.next(true);
                return next.handle(request.clone());
            }),
            catchError(() => {
                this.handlingRefresh = false;
                this.handle401Failure();
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

    private isUrlInBlacklist(url: string): boolean {
        if (this.unauthorizedUrlBlacklist.length === 0) {
            console.warn('ngx-auth-utils: Refresh token feature is enabled but unauthorizedUrlBlacklist is empty');
            console.warn('ngx-auth-utils: Blacklist at least the refresh token URL for correct session expiration handling');
        }
        return this.unauthorizedUrlBlacklist.includes(new URL(url).pathname);
    }
}
