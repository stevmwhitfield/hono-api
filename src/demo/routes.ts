import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { JwtVariables } from 'hono/jwt';
import { jwtAuth } from '~/auth/middleware';
import { db } from '~/db/db';

type Variables = JwtVariables;

const demo = new Hono<{ Variables: Variables }>();

demo.use('*', jwtAuth);

demo.get('/me', async (c) => {
    const jwtPayload = await c.get('jwtPayload');
    if (!jwtPayload || !jwtPayload.sub) {
        throw new HTTPException(401, { message: 'invalid token' });
    }
    if (typeof jwtPayload.sub !== 'string') {
        throw new HTTPException(401, { message: 'invalid token' });
    }

    const user = await db.findUserById(jwtPayload.sub);
    if (!user) {
        throw new HTTPException(404, { message: 'user not found' });
    }

    return c.json({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
    });
});

export { demo };
