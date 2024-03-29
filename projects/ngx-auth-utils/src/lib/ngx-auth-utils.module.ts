import { ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { AuthenticationProvider, FakeAuthenticationProvider } from './providers/authentication.provider';
import {
    AUTHENTICATION_HEADER,
    AUTO_LOGIN,
    GLOBAL_USER_CONDITION_REDIRECT_URL,
    HOME_URL,
    NO_AUTH_REDIRECT_URL,
    REFRESH_TOKEN,
    SESSION_EXPIRED_REDIRECT_URL,
    STORAGE_KEY_PREFIX,
    TOKEN_TYPE,
    UNAUTHORIZED_URL_BLACKLIST,
} from './config';
import { AuthenticationService } from './services/authentication.service';
import { MemoryStorageProvider, StorageProvider } from './providers/storage.provider';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthExpiredInterceptor } from './interceptors/auth-expired.interceptor';
import { UserHasDirective } from './directives/user-has.directive';
import { IsAuthDirective } from './directives/is-auth.directive';
import { UserDirective } from './directives/user.directive';
import { NgxAuthService } from './services/ngx-auth.service';

export interface NgxAuthUtilsConfig {
    authenticationProvider: Provider;
    storageProvider?: Provider;
    authenticationHeader?: string;
    tokenType?: 'Token' | 'Bearer' | string;
    homeUrl?: string;
    noAuthRedirectUrl?: string;
    sessionExpiredRedirectUrl?: string;
    globalUserConditionRedirectUrl?: string;
    refreshToken?: boolean;
    autoLogin?: boolean;
    storageKeyPrefix?: string;
    unauthorizedUrlBlacklist?: string[];
}

@NgModule({
    declarations: [IsAuthDirective, UserHasDirective, UserDirective],
    imports: [],
    exports: [IsAuthDirective, UserHasDirective, UserDirective],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            multi: true,
            useClass: AuthExpiredInterceptor,
        },
        {
            provide: HTTP_INTERCEPTORS,
            multi: true,
            useClass: AuthInterceptor,
        },
    ],
})
export class NgxAuthUtilsModule {
    static forRoot(config: NgxAuthUtilsConfig): ModuleWithProviders<NgxAuthUtilsModule> {
        return {
            ngModule: NgxAuthUtilsModule,
            providers: [
                config.authenticationProvider ?? {
                    provider: AuthenticationProvider,
                    useClass: FakeAuthenticationProvider,
                },
                config.storageProvider ?? {
                    provide: StorageProvider,
                    useClass: MemoryStorageProvider,
                },
                { provide: HOME_URL, useValue: config?.homeUrl ?? '/' },
                {
                    provide: AUTHENTICATION_HEADER,
                    useValue: config?.authenticationHeader ?? 'Authorization',
                },
                { provide: TOKEN_TYPE, useValue: config?.tokenType ?? 'Bearer' },
                { provide: NO_AUTH_REDIRECT_URL, useValue: config?.noAuthRedirectUrl },
                { provide: SESSION_EXPIRED_REDIRECT_URL, useValue: config?.sessionExpiredRedirectUrl },
                { provide: GLOBAL_USER_CONDITION_REDIRECT_URL, useValue: config?.globalUserConditionRedirectUrl },
                { provide: REFRESH_TOKEN, useValue: config?.refreshToken ?? false },
                { provide: AUTO_LOGIN, useValue: config?.autoLogin ?? true },
                { provide: STORAGE_KEY_PREFIX, useValue: config?.storageKeyPrefix ?? 'ngx-auth' },
                { provide: UNAUTHORIZED_URL_BLACKLIST, useValue: config.unauthorizedUrlBlacklist ?? [] },
                AuthenticationService,
                NgxAuthService,
            ],
        };
    }
}
