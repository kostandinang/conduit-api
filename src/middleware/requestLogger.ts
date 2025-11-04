import type { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

/**
 * Request Logger Middleware
 *
 * Logs all incoming HTTP requests with relevant metadata
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
	logger.info(
		{
			method: req.method,
			path: req.path,
			ip: req.ip,
			userAgent: req.get('user-agent'),
		},
		'Incoming request'
	);

	next();
}
