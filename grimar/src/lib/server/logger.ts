import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

const { combine, timestamp, json, printf, colorize, errors } = winston.format;

// Define log directory
const logDir = 'logs';

// Helper to serialize metadata with proper Error handling
function serializeMeta(obj: Record<string, unknown>): string {
	return JSON.stringify(obj, (key, value) => {
		if (value instanceof Error) {
			return {
				name: value.name,
				message: value.message,
				stack: value.stack
			};
		}
		return value;
	});
}

// Custom format for development
const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
	let logMessage = `${timestamp} [${level}]: ${message}`;

	if (stack) {
		logMessage += `
${stack}`;
	}

	if (Object.keys(meta).length > 0 && !meta.service) {
		logMessage += ` ${serializeMeta(meta)}`;
	}

	return logMessage;
});

// Define a custom Logger interface supporting multiple call patterns:
// - log.info('message') - single message
// - log.info('message', {meta}) - message with metadata
// - log.info({meta}, 'message') - metadata with message (swapped)
type CustomLogger = {
	// Single message
	info(msg: string): CustomLogger;
	warn(msg: string): CustomLogger;
	error(msg: string): CustomLogger;
	debug(msg: string): CustomLogger;

	// Message first, meta second (winston native)
	info(msg: string, meta: Record<string, unknown>): CustomLogger;
	warn(msg: string, meta: Record<string, unknown>): CustomLogger;
	error(msg: string, meta: Record<string, unknown>): CustomLogger;
	debug(msg: string, meta: Record<string, unknown>): CustomLogger;

	// Meta first, message second (project convention)
	info(meta: Record<string, unknown>, msg: string): CustomLogger;
	warn(meta: Record<string, unknown>, msg: string): CustomLogger;
	error(meta: Record<string, unknown>, msg: string): CustomLogger;
	debug(meta: Record<string, unknown>, msg: string): CustomLogger;

	child(context: Record<string, unknown>): CustomLogger;
};

// Create the base winston logger
const winstonLogger = winston.createLogger({
	level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
	format: combine(
		timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		errors({ stack: true }), // Print stack trace
		json() // Default to JSON for easy parsing
	),
	defaultMeta: { service: 'grimar-app' },
	transports: [
		//
		// - Write all logs with importance level of `error` or less to `error-%DATE%.log`
		// - Write all logs with importance level of `info` or less to `combined-%DATE%.log`
		//
		new winston.transports.DailyRotateFile({
			filename: path.join(logDir, 'error-%DATE%.log'),
			datePattern: 'YYYY-MM-DD',
			zippedArchive: true,
			maxSize: '20m',
			maxFiles: '14d',
			level: 'error'
		}),
		new winston.transports.DailyRotateFile({
			filename: path.join(logDir, 'combined-%DATE%.log'),
			datePattern: 'YYYY-MM-DD',
			zippedArchive: true,
			maxSize: '20m',
			maxFiles: '14d'
		})
	]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV === 'development') {
	winstonLogger.add(
		new winston.transports.Console({
			format: combine(colorize(), devFormat)
		})
	);
} else {
	// In production, we still often want console logs (e.g. for Docker/Kubernetes)
	// but typically in JSON format.
	winstonLogger.add(
		new winston.transports.Console({
			format: json()
		})
	);
}

/**
 * Wrapper to ensure proper argument order: (message, meta?)
 * The codebase calls log.info({meta}, 'message') but winston expects (message, {meta})
 * This wrapper swaps the arguments so both work correctly.
 */
function createWrapper(w: winston.Logger): CustomLogger {
	const wrapper = {
		info: (
			msgOrMeta: string | Record<string, unknown>,
			msgOrMetaArg?: string | Record<string, unknown>
		) => {
			if (typeof msgOrMeta === 'string' && typeof msgOrMetaArg === 'object') {
				return w.info(msgOrMeta, msgOrMetaArg) as unknown as CustomLogger;
			}
			if (typeof msgOrMeta === 'object' && typeof msgOrMetaArg === 'string') {
				return w.info(msgOrMetaArg, msgOrMeta) as unknown as CustomLogger;
			}
			return w.info(msgOrMeta as string) as unknown as CustomLogger;
		},
		warn: (
			msgOrMeta: string | Record<string, unknown>,
			msgOrMetaArg?: string | Record<string, unknown>
		) => {
			if (typeof msgOrMeta === 'string' && typeof msgOrMetaArg === 'object') {
				return w.warn(msgOrMeta, msgOrMetaArg) as unknown as CustomLogger;
			}
			if (typeof msgOrMeta === 'object' && typeof msgOrMetaArg === 'string') {
				return w.warn(msgOrMetaArg, msgOrMeta) as unknown as CustomLogger;
			}
			return w.warn(msgOrMeta as string) as unknown as CustomLogger;
		},
		error: (
			msgOrMeta: string | Record<string, unknown>,
			msgOrMetaArg?: string | Record<string, unknown>
		) => {
			if (typeof msgOrMeta === 'string' && typeof msgOrMetaArg === 'object') {
				return w.error(msgOrMeta, msgOrMetaArg) as unknown as CustomLogger;
			}
			if (typeof msgOrMeta === 'object' && typeof msgOrMetaArg === 'string') {
				return w.error(msgOrMetaArg, msgOrMeta) as unknown as CustomLogger;
			}
			return w.error(msgOrMeta as string) as unknown as CustomLogger;
		},
		debug: (
			msgOrMeta: string | Record<string, unknown>,
			msgOrMetaArg?: string | Record<string, unknown>
		) => {
			if (typeof msgOrMeta === 'string' && typeof msgOrMetaArg === 'object') {
				return w.debug(msgOrMeta, msgOrMetaArg) as unknown as CustomLogger;
			}
			if (typeof msgOrMeta === 'object' && typeof msgOrMetaArg === 'string') {
				return w.debug(msgOrMetaArg, msgOrMeta) as unknown as CustomLogger;
			}
			return w.debug(msgOrMeta as string) as unknown as CustomLogger;
		},
		child: (context: Record<string, unknown>) => createWrapper(w.child(context))
	};
	return wrapper;
}

const logger = createWrapper(winstonLogger);

/**
 * Create a child logger with module context
 * @param module - The module name (e.g., 'CompendiumSync', 'AuthService')
 * @returns A child logger with module context
 */
export function createModuleLogger(module: string): CustomLogger {
	return logger.child({ module });
}

/**
 * Create a child logger with custom context
 * @param context - Additional context to include in all logs
 * @returns A child logger with the provided context
 */
export function createLogger(context: Record<string, unknown>): CustomLogger {
	return logger.child(context);
}

export type Logger = CustomLogger;

export default logger;
