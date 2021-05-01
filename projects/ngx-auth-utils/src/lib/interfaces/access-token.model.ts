export interface AccessTokenModel {
    accessToken: string;
    refreshToken?: string;
    metadata?: { [key: string]: unknown };
    dynamicStorage?: 'local' | 'session' | 'memory';
}
