import pino from 'pino';
import { config } from './config';

export const logger = pino({
	level: config.server.env === 'production' ? 'info' : 'debug',
	serializers: {
		error: pino.stdSerializers.err,
	},
	transport:
		config.server.env === 'development'
			? {
					target: 'pino-pretty',
					options: {
						colorize: true,
						translateTime: 'SYS:standard',
						ignore: 'pid,hostname',
					},
				}
			: undefined,
});
