import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest,} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {EMPTY, Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {AuthenticationService} from '../services/authentication.service';
import { StorageProvider} from "../providers/storage.provider";
import {LOGIN_URL} from "../config";

@Injectable()
export class AuthExpiredInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private storageProvider: StorageProvider,
    private authenticationService: AuthenticationService,
    @Inject(LOGIN_URL) private loginUrl: string,
  ) {}

  // TODO: Configurable?
  private isUrlInWhitelist(url: string): boolean {
    return (
      // login can have parameter fromLogout
      url.startsWith('/login') ||
      url === '/register' ||
      url.startsWith('/reset-password') ||
      url.startsWith('/activate')
    );
  }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 && err.url) {
          // TODO: Refresh token stuff
          this.authenticationService.logout();

          if (this.isUrlInWhitelist(this.router.routerState.snapshot.url)) {
            return EMPTY;
          }

          console.error('REDIRECT?', this.loginUrl);
          this.router.navigate([this.loginUrl]);
          return EMPTY;
        }
        return throwError(err);
      })
    );
  }
}
