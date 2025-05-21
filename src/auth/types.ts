export type TokenRequest = { email: string; password: string };

export interface AccessTokenClaims {
  email: string;
  role: string;
  sessionId: string;
}
