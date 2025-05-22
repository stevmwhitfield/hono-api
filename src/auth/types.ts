export type PasswordTokenRequest = { email: string; password: string };
export type RefreshTokenRequest = { refreshToken: string };

export interface AccessTokenClaims {
    email: string;
    role: string;
    sessionId: string;
}
