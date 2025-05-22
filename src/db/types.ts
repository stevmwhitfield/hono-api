export interface User {
    id: string;
    email: string;
    password_hash: string;
    salt: string;
    created_at: Date;
    updated_at: Date;
}

export interface RefreshToken {
    id: string;
    user_id: string;
    user_email: string;
    issued_at: Date;
    expires_at: Date;
    is_revoked: boolean;
}
