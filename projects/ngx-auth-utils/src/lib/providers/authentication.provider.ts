import { Observable, of } from 'rxjs';
import { AccessTokenModel } from '../interfaces/access-token.model';

export abstract class AuthenticationProvider {
    public abstract fetchUser(): Observable<any>;

    public abstract doLogin(credentials: any): Observable<AccessTokenModel>;

    public refreshToken(accessToken: string, refreshToken: string): Observable<AccessTokenModel> {
        // TODO: Improve error: When there is a refresh token but no implementation for renewing it
        throw Error('Refresh token not implemented');
    }
}

export class FakeAuthenticationProvider extends AuthenticationProvider {
    public fetchUser(): Observable<{}> {
        return of({});
    }

    public doLogin(credentials: {}): Observable<AccessTokenModel> {
        return of({ accessToken: 'fake', refreshToken: 'fake' });
    }
}
