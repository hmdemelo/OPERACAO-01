import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const pinoInstance = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: isProduction
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
                colorize: true,
                ignore: 'pid,hostname',
                translateTime: 'SYS:standard',
            },
        },
    browser: {
        asObject: true,
    },
    base: {
        env: process.env.NODE_ENV, // Optional metadata
    },
});

export const logger = {
    info: (...args: any[]) => {
        if (args.length === 1) return pinoInstance.info(args[0]);
        return pinoInstance.info({ data: args }, typeof args[0] === 'string' ? args[0] : 'Log info');
    },
    error: (...args: any[]) => {
        const errObj = args.find((a) => a instanceof Error);
        const strings = args.filter((a) => typeof a === 'string');
        const msg = strings.join(' ');

        if (errObj) {
            pinoInstance.error(errObj, msg);
        } else if (args.length === 2 && typeof args[0] === 'string') {
            pinoInstance.error({ err: args[1] }, args[0]);
        } else {
            pinoInstance.error({ data: args.length > 1 ? args : undefined }, msg || (args.length === 1 ? args[0] : 'Error'));
        }
    },
    warn: (...args: any[]) => {
        if (args.length === 1) return pinoInstance.warn(args[0]);
        return pinoInstance.warn({ data: args }, typeof args[0] === 'string' ? args[0] : 'Warning');
    },
    debug: (...args: any[]) => {
        if (args.length === 1) return pinoInstance.debug(args[0]);
        return pinoInstance.debug({ data: args }, typeof args[0] === 'string' ? args[0] : 'Debug');
    },
    pino: pinoInstance,
};
