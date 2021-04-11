import { Observable, of } from 'rxjs';
import { AccessTokenModel } from '../interfaces/access-token.model';

export abstract class AuthenticationProvider {
  public abstract fetchUser(): Observable<any>;

  public abstract doLogin(credentials: any): Observable<AccessTokenModel>;
}

export class FakeAuthenticationProvider extends AuthenticationProvider {
  public fetchUser(): Observable<{}> {
    return of({});
  }

  public doLogin(credentials: {}): Observable<AccessTokenModel> {
    return of({ accessToken: 'fake', refreshToken: 'fake' });
  }
}
