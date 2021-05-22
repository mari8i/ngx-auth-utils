import { InjectionToken } from '@angular/core';

export const HOME_URL = new InjectionToken<string>('HOME_URL');
export const AUTHENTICATION_HEADER = new InjectionToken<string>('AUTHENTICATION_HEADER');
export const TOKEN_TYPE = new InjectionToken<string>('TOKEN_TYPE');
export const NO_AUTH_REDIRECT_URL = new InjectionToken<string>('NO_AUTH_REDIRECT_URL');
export const GLOBAL_USER_CONDITION_REDIRECT_URL = new InjectionToken<string>('GLOBAL_USER_CONDITION_REDIRECT_URL');
export const SESSION_EXPIRED_REDIRECT_URL = new InjectionToken<string>('SESSION_EXPIRED_REDIRECT_URL');
export const REFRESH_TOKEN = new InjectionToken<string>('REFRESH_TOKEN');
export const AUTO_LOGIN = new InjectionToken<string>('AUTO_LOGIN');
export const STORAGE_KEY_PREFIX = new InjectionToken<string>('STORAGE_KEY_PREFIX');
export const UNAUTHORIZED_URL_BLACKLIST = new InjectionToken<string>('UNAUTHORIZED_URL_BLACKLIST');
