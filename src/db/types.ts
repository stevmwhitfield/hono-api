export interface User {
    id: string;
    email: string;
    password_hash: string;
    salt: string;
    email_confirmed_at: string | null;
    created_at: Date;
    updated_at: Date;
}
