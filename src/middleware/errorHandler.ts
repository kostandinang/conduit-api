import type { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

/**
 * 404 Not Found Handler
 *
 * Catches all requests that don't match any routes
 */
export function notFoundHandler(req: Request, res: Response): void {
	logger.warn(
		{
			method: req.method,
			path: req.path,
			ip: req.ip,
		},
		'404 - Endpoint not found'
	);

	res.status(404).json({
		success: false,
		error: 'Endpoint not found',
		path: req.path,
	});
}

/**
 * Global Error Handler
 *
 * Catches all unhandled errors and returns consistent error responses
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
	logger.error(
		{
			error: err,
			method: req.method,
			path: req.path,
			ip: req.ip,
		},
		'Unhandled error'
	);

	// Don't expose internal errors in production
	const isDev = process.env.NODE_ENV === 'development';

	res.status(err.status || 500).json({
		success: false,
		error: isDev ? err.message : 'Internal server error',
		...(isDev && { stack: err.stack }),
	});
}
