import { InjectionToken } from '@angular/core';

export const HOME_URL = new InjectionToken<string>('HOME_URL');
export const AUTHENTICATION_HEADER = new InjectionToken<string>('AUTHENTICATION_HEADER');
export const TOKEN_TYPE = new InjectionToken<string>('TOKEN_TYPE');
export const NO_AUTH_REDIRECT_URL = new InjectionToken<string>('NO_AUTH_REDIRECT_URL');
export const GLOBAL_USER_CONDITION_REDIRECT_URL = new InjectionToken<string>('GLOBAL_USER_CONDITION_REDIRECT_URL');
export const SESSION_EXPIRED_REDIRECT_URL = new InjectionToken<string>('SESSION_EXPIRED_REDIRECT_URL');
export const USE_COOKIES = new InjectionToken<string>('USE_COOKIES');
export const REFRESH_TOKEN = new InjectionToken<string>('REFRESH_TOKEN');
