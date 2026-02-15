/**
 * Client-side logger for browser code
 * Provides a compatible API with the server logger but uses console methods
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
	[key: string]: unknown;
}

class ClientLogger {
	private context: LogContext;

	constructor(context: LogContext = {}) {
		this.context = context;
	}

	private formatMessage(message: string, meta: LogContext = {}): string {
		const allContext = { ...this.context, ...meta };
		const contextStr = Object.keys(allContext).length > 0 ? ` ${JSON.stringify(allContext)}` : '';
		return `${message}${contextStr}`;
	}

	info(messageOrMeta: string | LogContext, messageOrMetaArg?: string | LogContext): ClientLogger {
		if (typeof messageOrMeta === 'string' && typeof messageOrMetaArg === 'object') {
			console.info(this.formatMessage(messageOrMeta, messageOrMetaArg));
		} else if (typeof messageOrMeta === 'object' && typeof messageOrMetaArg === 'string') {
			console.info(this.formatMessage(messageOrMetaArg, messageOrMeta));
		} else if (typeof messageOrMeta === 'string') {
			console.info(this.formatMessage(messageOrMeta));
		}
		return this;
	}

	warn(messageOrMeta: string | LogContext, messageOrMetaArg?: string | LogContext): ClientLogger {
		if (typeof messageOrMeta === 'string' && typeof messageOrMetaArg === 'object') {
			console.warn(this.formatMessage(messageOrMeta, messageOrMetaArg));
		} else if (typeof messageOrMeta === 'object' && typeof messageOrMetaArg === 'string') {
			console.warn(this.formatMessage(messageOrMetaArg, messageOrMeta));
		} else if (typeof messageOrMeta === 'string') {
			console.warn(this.formatMessage(messageOrMeta));
		}
		return this;
	}

	error(messageOrMeta: string | LogContext, messageOrMetaArg?: string | LogContext): ClientLogger {
		if (typeof messageOrMeta === 'string' && typeof messageOrMetaArg === 'object') {
			console.error(this.formatMessage(messageOrMeta, messageOrMetaArg));
		} else if (typeof messageOrMeta === 'object' && typeof messageOrMetaArg === 'string') {
			console.error(this.formatMessage(messageOrMetaArg, messageOrMeta));
		} else if (typeof messageOrMeta === 'string') {
			console.error(this.formatMessage(messageOrMeta));
		}
		return this;
	}

	debug(messageOrMeta: string | LogContext, messageOrMetaArg?: string | LogContext): ClientLogger {
		if (typeof messageOrMeta === 'string' && typeof messageOrMetaArg === 'object') {
			console.debug(this.formatMessage(messageOrMeta, messageOrMetaArg));
		} else if (typeof messageOrMeta === 'object' && typeof messageOrMetaArg === 'string') {
			console.debug(this.formatMessage(messageOrMetaArg, messageOrMeta));
		} else if (typeof messageOrMeta === 'string') {
			console.debug(this.formatMessage(messageOrMeta));
		}
		return this;
	}

	child(additionalContext: LogContext): ClientLogger {
		return new ClientLogger({ ...this.context, ...additionalContext });
	}
}

/**
 * Create a client-side logger with context
 */
export function createLogger(context: LogContext): ClientLogger {
	return new ClientLogger(context);
}

export type { ClientLogger as Logger };
