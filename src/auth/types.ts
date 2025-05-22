export type PasswordTokenRequest = { email: string; password: string };
export type RefreshTokenRequest = { refresh_token: string };

export interface AccessTokenClaims {
    email: string;
    role: string;
    sessionId: string;
}
