import { Observable, of } from 'rxjs';
import { AccessTokenModel } from '../interfaces/access-token.model';

export abstract class AuthenticationProvider {
    public abstract fetchUser(): Observable<unknown>;

    public abstract doLogin(credentials: unknown): Observable<AccessTokenModel>;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public refreshToken(accessToken: string, refreshToken: string, metadata?: { [key: string]: unknown }): Observable<AccessTokenModel> {
        // TODO: Improve error: When there is a refresh token but no implementation for renewing it
        throw Error('Refresh token not implemented');
    }
}

export class FakeAuthenticationProvider extends AuthenticationProvider {
    public fetchUser(): Observable<unknown> {
        return of({});
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public doLogin(credentials: unknown): Observable<AccessTokenModel> {
        return of({ accessToken: 'fake', refreshToken: 'fake' });
    }
}
