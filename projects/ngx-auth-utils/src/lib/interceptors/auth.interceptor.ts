import { Inject, Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTHENTICATION_HEADER, TOKEN_TYPE, USE_COOKIES } from '../config';
import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private authenticationService: AuthenticationService,
        @Inject(AUTHENTICATION_HEADER)
        private authenticationHeader: string = 'Authorization',
        @Inject(TOKEN_TYPE) private tokenType: string = 'Bearer',
        @Inject(USE_COOKIES) private useCookies: boolean = false
    ) {}

    public static addHeaderToRequest(
        request: HttpRequest<unknown>,
        authHeader: string,
        tokenType: string,
        accessToken: string
    ): HttpRequest<unknown> {
        return request.clone({
            headers: request.headers.set(authHeader, tokenType + ' ' + accessToken),
        });
    }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        if (this.useCookies) {
            request = request.clone({
                withCredentials: true,
            });

            return next.handle(request);
            // TODO: ALSO add token header??
        }

        const accessToken = this.authenticationService.getAccessToken();

        if (accessToken) {
            const clonedReq = AuthInterceptor.addHeaderToRequest(request, this.authenticationHeader, this.tokenType, accessToken);
            return next.handle(clonedReq);
        }

        return next.handle(request);
    }
}
