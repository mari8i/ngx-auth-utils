import {Inject, Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest,} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AUTHENTICATION_HEADER, TOKEN_TYPE} from '../config';
import {StorageProvider} from '../providers/storage.provider';
import {AuthenticationService} from "../services/authentication.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authenticationService: AuthenticationService,
    @Inject(AUTHENTICATION_HEADER)
    private authenticationHeader: string = 'Authorization',
    @Inject(TOKEN_TYPE) private tokenType: string = 'Bearer'
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const accessToken = this.authenticationService.getAccessToken();

    if (accessToken) {
      const clonedReq = request.clone({
        headers: request.headers.set(
          this.authenticationHeader,
          this.tokenType + ' ' + accessToken
        ),
      });

      return next.handle(clonedReq);
    }

    return next.handle(request);
  }
}
