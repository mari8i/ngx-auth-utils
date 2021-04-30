export interface AccessTokenModel {
    accessToken: string;
    refreshToken?: string;
    metadata?: { [key: string]: unknown };
    storage?: 'local' | 'session' | 'memory';
}
