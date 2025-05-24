import crypto from 'crypto';

function hashPassword(password: string, salt: string): Promise<string> {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, 64, (err, hash) => {
            if (err) {
                reject(err);
            }
            resolve(hash.toString('hex'));
        });
    });
}

async function comparePassword(password: string, salt: string, hashedPassword: string) {
    const inputHashedPassword = await hashPassword(password, salt);
    return crypto.timingSafeEqual(
        Buffer.from(inputHashedPassword, 'hex'),
        Buffer.from(hashedPassword, 'hex'),
    );
}

function generateSalt() {
    return crypto.randomBytes(16).toString('hex');
}

export { hashPassword, comparePassword, generateSalt };
