import { Context } from 'hono';
import { env } from '../env';
import { verify } from 'hono/jwt';

async function getRequestAudience(c: Context) {
  let aud = c.req.header('X-JWT-AUD');
  if (aud) {
    return aud;
  }

  const claims = await getClaims(c);
  if (claims) {
    aud = claims.aud as string;
    if (aud) {
      return aud;
    }
  }

  return env.JWT_AUD;
}

async function getClaims(c: Context) {
  const token = getToken(c);
  if (!token) {
    return null;
  }
  const jwtPayload = await verify(token, env.JWT_SECRET);
  return jwtPayload;
}

function getToken(c: Context) {
  const token = c.get('jwtToken') as string;
  if (!token) {
    return null;
  }

  return token;
}

export { getRequestAudience };
