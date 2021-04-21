import { TestBed } from '@angular/core/testing';

import { UserResolver } from './user.resolver';
import { AuthenticationService } from '../services/authentication.service';
import { BehaviorSubject } from 'rxjs';

describe('UserResolver', () => {
    let resolver: UserResolver;
    let authService: jasmine.SpyObj<AuthenticationService>;

    beforeEach(() => {
        const authSpy = jasmine.createSpyObj('AuthenticationService', ['getAuthenticationState']);

        TestBed.configureTestingModule({
            providers: [
                {
                    provide: AuthenticationService,
                    useValue: authSpy,
                },
            ],
        });
        resolver = TestBed.inject(UserResolver);
        authService = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;
    });

    it('should be created', () => {
        expect(resolver).toBeTruthy();
    });

    it('resolves authenticated user', (done: DoneFn) => {
        const user = { user: 'username' };
        const authState = new BehaviorSubject<unknown>(user);
        authService.getAuthenticationState.and.returnValue(authState.asObservable());

        const result = resolver.resolve();

        expect(authService.getAuthenticationState.calls.count()).toEqual(1);

        result.subscribe((value) => {
            expect(value).toEqual(user);
            done();
        });
    });
});
