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
