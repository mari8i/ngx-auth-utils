import { TestBed } from '@angular/core/testing';
import { EMPTY, of, throwError } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';
import { AuthenticationProvider } from '../providers/authentication.provider';
import { MemoryStorageProvider, StorageProvider } from '../providers/storage.provider';

import { AuthenticationService } from './authentication.service';
import { AUTO_LOGIN } from '../config';

describe('AuthenticationService', () => {
    let service: AuthenticationService;
    let authProviderSpy: jasmine.SpyObj<AuthenticationProvider>;
    let storageProvider: StorageProvider;

    beforeEach(() => {
        const authSpy = jasmine.createSpyObj('AuthenticationProvider', ['fetchUser', 'doLogin', 'refreshToken']);

        TestBed.configureTestingModule({
            providers: [
                AuthenticationService,
                { provide: StorageProvider, useValue: new MemoryStorageProvider() },
                { provide: AuthenticationProvider, useValue: authSpy },
                { provide: AUTO_LOGIN, useValue: true },
            ],
        });
        service = TestBed.inject(AuthenticationService);
        authProviderSpy = TestBed.inject(AuthenticationProvider) as jasmine.SpyObj<AuthenticationProvider>;
        storageProvider = TestBed.inject(StorageProvider);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should login if credentials are valid', (done: DoneFn) => {
        const user = { name: 'Foo', surname: 'Bar', email: 'foo@bar.com' };
        const credentials = {
            username: 'user',
            password: 'P@ss',
        };
        const tokenPair = { accessToken: 'access-token', refreshToken: 'refresh-token' };

        authProviderSpy.doLogin.and.returnValue(of(tokenPair));
        authProviderSpy.fetchUser.and.returnValue(of(user));

        expect(service.isAuthenticated()).toBeFalsy();

        service.login(credentials).subscribe((user) => {
            expect(user).toEqual(user);

            expect(authProviderSpy.doLogin.calls.count()).toEqual(1);
            expect(authProviderSpy.doLogin.calls.mostRecent().args).toEqual([credentials]);

            expect(storageProvider.retrieve(service.AUTH_ACCESS_TOKEN)).toEqual(tokenPair.accessToken);
            expect(storageProvider.retrieve(service.AUTH_REFRESH_TOKEN)).toEqual(tokenPair.refreshToken);

            expect(authProviderSpy.fetchUser.calls.count()).toEqual(1);

            expect(service.isAuthenticated()).toBeTruthy();
            service.getAuthenticationState().subscribe((auth) => {
                expect(auth).toBeTruthy();
                expect(auth).toEqual(user);
                done();
            });
        });
    });

    it('should not login if credentials are invalid', (done: DoneFn) => {
        const authError = { error: 'an-error' };

        authProviderSpy.doLogin.and.returnValue(throwError(authError));

        service
            .login({ foo: 'bar' })
            .pipe(
                catchError((err) => {
                    expect(err).toEqual(authError);
                    expect(service.isAuthenticated()).toBeFalsy();
                    done();
                    return EMPTY;
                })
            )
            .subscribe();
    });

    it('does not authenticate when credentials are valid but user could not be fetched', (done: DoneFn) => {
        const tokenPair = { accessToken: 'access-token', refreshToken: 'refresh-token' };
        const userError = { error: 'an-error' };

        authProviderSpy.doLogin.and.returnValue(of(tokenPair));
        authProviderSpy.fetchUser.and.returnValue(throwError(userError));

        service
            .login({ foo: 'bar' })
            .pipe(
                catchError((err) => {
                    expect(err).toEqual(userError);
                    expect(service.isAuthenticated()).toBeFalsy();

                    expect(storageProvider.retrieve(service.AUTH_ACCESS_TOKEN)).toBeUndefined();
                    expect(storageProvider.retrieve(service.AUTH_REFRESH_TOKEN)).toBeUndefined();
                    done();
                    return EMPTY;
                })
            )
            .subscribe();
    });

    it('caches authenticated user', (done: DoneFn) => {
        const user = { name: 'Foo', surname: 'Bar', email: 'foo@bar.com' };
        authProviderSpy.fetchUser.and.returnValue(of(user));

        service
            .getAuthenticatedUser()
            .pipe(concatMap(() => service.getAuthenticatedUser()))
            .subscribe(() => {
                expect(authProviderSpy.fetchUser.calls.count()).toEqual(1);
                done();
            });
    });

    it('ignores authenticated user cache when force=true', (done: DoneFn) => {
        const user = { name: 'Foo', surname: 'Bar', email: 'foo@bar.com' };
        authProviderSpy.fetchUser.and.returnValue(of(user));

        service
            .getAuthenticatedUser()
            .pipe(concatMap(() => service.getAuthenticatedUser(true)))
            .subscribe(() => {
                expect(authProviderSpy.fetchUser.calls.count()).toEqual(2);
                done();
            });
    });

    it('initializes requesting authenticated user when access token is present', (done: DoneFn) => {
        const user = { name: 'Foo', surname: 'Bar', email: 'foo@bar.com' };
        authProviderSpy.fetchUser.and.returnValue(of(user));

        storageProvider.store(service.AUTH_IS_AUTHENTICATED, JSON.stringify(new Date()));
        storageProvider.store(service.AUTH_ACCESS_TOKEN, 'valid-access-token');

        service.initialize().subscribe((authUser) => {
            expect(authUser).toEqual(user);

            expect(authProviderSpy.fetchUser.calls.count()).toEqual(1);
            done();
        });
    });

    it('does not authenticate when access token is present but user can not be fetched', (done: DoneFn) => {
        const userError = { error: 'foo' };
        authProviderSpy.fetchUser.and.returnValue(throwError(userError));

        storageProvider.store(service.AUTH_IS_AUTHENTICATED, JSON.stringify(new Date()));
        storageProvider.store(service.AUTH_ACCESS_TOKEN, 'expired-access-token');

        service.initialize().subscribe((authUser) => {
            expect(authUser).toBeFalsy();

            expect(authProviderSpy.fetchUser.calls.count()).toEqual(1);
            done();
        });
    });

    it('does not request authenticated user when access token is not present', (done: DoneFn) => {
        service.initialize().subscribe((authUser) => {
            expect(authUser).toEqual(null);

            expect(authProviderSpy.fetchUser.calls.count()).toEqual(0);
            done();
        });
    });
});
