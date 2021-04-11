import { InjectionToken } from '@angular/core';

export const LOGIN_URL = new InjectionToken<string>('LOGIN_URL');
export const HOME_URL = new InjectionToken<string>('HOME_URL');
export const AUTHENTICATION_HEADER = new InjectionToken<string>(
  'AUTHENTICATION_HEADER'
);
export const TOKEN_TYPE = new InjectionToken<string>('TOKEN_TYPE');
