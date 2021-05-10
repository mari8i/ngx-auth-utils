import { ActivatedRouteSnapshot, Route, RouterStateSnapshot } from '@angular/router';

export type AuthenticationEventType =
    | 'login'
    | 'auto-login'
    | 'login-failed'
    | 'logout'
    | 'session-expired'
    | 'initialized'
    | 'guard-blocked-access';

export type AuthUserType = { [key: string]: unknown };

export type UserType = AuthUserType | null;

export interface AccessTokenModel {
    accessToken: string;
    refreshToken?: string;
    metadata?: { [key: string]: unknown };
    dynamicStorage?: 'local' | 'session' | 'memory';
}

export interface AuthUserPredicates {
    condition: 'eq' | 'ne' | 'any' | 'all' | 'none';
    attribute: string;
    value: any;
    redirectRoute?: string | false;
}

export interface AuthUserSnapshot {
    authenticated: boolean;
    user: UserType;
}

export type EventGuardData = {
    guardName: string;
    route?: ActivatedRouteSnapshot | Route;
    state?: RouterStateSnapshot;
};

export class AuthenticationEvent {
    public get type(): AuthenticationEventType {
        return this._type;
    }

    public get user(): UserType {
        return this._user;
    }

    public get guardData(): EventGuardData | undefined {
        return this._guardData;
    }

    constructor(private _type: AuthenticationEventType, private _user: UserType, private _guardData?: EventGuardData) {}
}
