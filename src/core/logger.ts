import { hostname } from 'os';
import { pinoLogger } from 'hono-pino';
import createPino, { stdSerializers, stdTimeFunctions } from 'pino';
import { env } from './env';

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

const baseLogger = createPino({
    level: logLevel,
    transport: isProduction
        ? undefined
        : {
              target: 'pino-pretty',
              options: {
                  colorize: true,
                  translateTime: 'yyyy-mm-dd HH:MM:ss',
                  ignore: 'pid,hostname',
              },
          },
    base: {
        pid: process.pid,
        hostname: hostname(),
        service: 'hono-api',
        version: '1.0.0',
    },
    timestamp: stdTimeFunctions.isoTime,
    redact: {
        paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.headers["x-api-key"]',
            'res.headers["set-cookie"]',
            'password',
            'token',
            'secret',
            'apiKey',
        ],
        censor: '[REDACTED]',
    },
});

const customSerializers = {
    req: stdSerializers.req,
    res: stdSerializers.res,
    err: stdSerializers.err,
};

const logger = baseLogger.child({}, { serializers: customSerializers });

function customLogger() {
    return pinoLogger({ pino: logger });
}

export { customLogger };
