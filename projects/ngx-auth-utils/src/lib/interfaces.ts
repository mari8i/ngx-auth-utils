export type AuthenticationEventType = 'login' | 'login-failed' | 'logout' | 'session-expired' | 'initialized';

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

export class AuthenticationEvent {
    public get type(): AuthenticationEventType {
        return this._type;
    }

    public get user(): UserType {
        return this._user;
    }

    constructor(private _type: AuthenticationEventType, private _user: UserType) {}
}
