export interface User {
    id: string;
    email: string;
    password_hash: string;
    salt: string;
    created_at: string;
    updated_at: string;
}

export interface RefreshToken {
    id: string;
    user_id: string;
    user_email: string;
    issued_at: string;
    expires_at: string;
    is_revoked: boolean;
}
