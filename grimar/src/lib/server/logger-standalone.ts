/**
 * Simple Logger for CLI Scripts
 *
 * Console-based logger without SvelteKit dependency.
 * Matches the API of createModuleLogger for compatibility.
 */

interface LogMeta {
	[key: string]: unknown;
}

interface SimpleLogger {
	info: (msg: string, meta?: LogMeta) => void;
	warn: (msg: string, meta?: LogMeta) => void;
	error: (msg: string, meta?: LogMeta) => void;
	debug: (msg: string, meta?: LogMeta) => void;
}

/**
 * Create a simple logger for CLI scripts
 */
export function createSimpleLogger(module: string): SimpleLogger {
	const formatMessage = (msg: string, meta?: LogMeta): string => {
		if (meta && Object.keys(meta).length > 0) {
			const metaStr = JSON.stringify(meta);
			return `${msg} ${metaStr}`;
		}
		return msg;
	};

	return {
		info: (msg: string, meta?: LogMeta) => {
			console.log(`[INFO] [${module}] ${formatMessage(msg, meta)}`);
		},
		warn: (msg: string, meta?: LogMeta) => {
			console.warn(`[WARN] [${module}] ${formatMessage(msg, meta)}`);
		},
		error: (msg: string, meta?: LogMeta) => {
			console.error(`[ERROR] [${module}] ${formatMessage(msg, meta)}`);
		},
		debug: (msg: string, meta?: LogMeta) => {
			if (process.env.DEBUG || process.env.VERBOSE) {
				console.log(`[DEBUG] [${module}] ${formatMessage(msg, meta)}`);
			}
		}
	};
}
