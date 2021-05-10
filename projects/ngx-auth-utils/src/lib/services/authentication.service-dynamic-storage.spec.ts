import { TestBed } from '@angular/core/testing';
import { EMPTY, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationProvider } from '../providers/authentication.provider';
import { DynamicStorageProvider, StorageProvider } from '../providers/storage.provider';

import { AuthenticationService } from './authentication.service';
import { AccessTokenModel } from '../interfaces';
import { AUTO_LOGIN, STORAGE_KEY_PREFIX } from '../config';

describe('AuthenticationServiceWithDynamicStorage', () => {
    let service: AuthenticationService;
    let authProviderSpy: jasmine.SpyObj<AuthenticationProvider>;
    let storageProvider: DynamicStorageProvider;

    const user = { name: 'Foo', surname: 'Bar', email: 'foo@bar.com' };
    const credentials = {
        username: 'user',
        password: 'P@ss',
    };

    beforeEach(() => {
        const authSpy = jasmine.createSpyObj('AuthenticationProvider', ['fetchUser', 'doLogin', 'refreshToken']);

        TestBed.configureTestingModule({
            providers: [
                AuthenticationService,
                { provide: StorageProvider, useValue: new DynamicStorageProvider() },
                { provide: AuthenticationProvider, useValue: authSpy },
                { provide: AUTO_LOGIN, useValue: true },
                { provide: STORAGE_KEY_PREFIX, useValue: 'ngx-auth-test' },
            ],
        });
        service = TestBed.inject(AuthenticationService);
        authProviderSpy = TestBed.inject(AuthenticationProvider) as jasmine.SpyObj<AuthenticationProvider>;
        storageProvider = TestBed.inject(StorageProvider) as DynamicStorageProvider;
    });

    it('initializes the storage provider on login', (done: DoneFn) => {
        const tokenPair: AccessTokenModel = { accessToken: 'access-token', refreshToken: 'refresh-token', dynamicStorage: 'session' };

        authProviderSpy.doLogin.and.returnValue(of(tokenPair));
        authProviderSpy.fetchUser.and.returnValue(of(user));

        service.login(credentials).subscribe(() => {
            expect(storageProvider.getType()).toEqual('session');
            done();
        });
    });

    it('raises error if no dynamic storage is specified', (done: DoneFn) => {
        const tokenPair: AccessTokenModel = { accessToken: 'access-token', refreshToken: 'refresh-token' };

        authProviderSpy.doLogin.and.returnValue(of(tokenPair));
        authProviderSpy.fetchUser.and.returnValue(of(user));

        service
            .login(credentials)
            .pipe(
                catchError((err) => {
                    expect(err).toEqual(Error('No storage type specified on login while using a dynamic storage provider'));
                    done();
                    return EMPTY;
                })
            )
            .subscribe();
    });
});
