/**
 * Standardized API Error with error codes
 */

export type ApiErrorCode =
	| 'NETWORK_ERROR'
	| 'NOT_FOUND'
	| 'UNAUTHORIZED'
	| 'FORBIDDEN'
	| 'VALIDATION_ERROR'
	| 'SERVER_ERROR'
	| 'TIMEOUT'
	| 'OFFLINE'
	| 'CONFLICT'
	| 'UNKNOWN';

export class ApiError extends Error {
	readonly code: ApiErrorCode;
	readonly status: number;
	readonly details?: Record<string, unknown>;
	readonly isRetryable: boolean;

	constructor(
		message: string,
		code: ApiErrorCode,
		status: number = 500,
		details?: Record<string, unknown>
	) {
		super(message);
		this.name = 'ApiError';
		this.code = code;
		this.status = status;
		this.details = details;
		this.isRetryable = ['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR'].includes(code);
	}

	/**
	 * Create ApiError from fetch Response
	 */
	static fromResponse(response: Response, body?: string): ApiError {
		const codeMap: Record<number, ApiErrorCode> = {
			400: 'VALIDATION_ERROR',
			401: 'UNAUTHORIZED',
			403: 'FORBIDDEN',
			404: 'NOT_FOUND',
			408: 'TIMEOUT',
			409: 'CONFLICT',
			500: 'SERVER_ERROR',
			502: 'SERVER_ERROR',
			503: 'SERVER_ERROR'
		};
		return new ApiError(
			body || response.statusText,
			codeMap[response.status] || 'SERVER_ERROR',
			response.status
		);
	}

	/**
	 * Network error (fetch failed, CORS, etc.)
	 */
	static networkError(message: string = 'Network request failed'): ApiError {
		return new ApiError(message, 'NETWORK_ERROR', 0);
	}

	/**
	 * Offline error - good for queueing
	 */
	static offline(): ApiError {
		return new ApiError('Device is offline', 'OFFLINE', 0);
	}

	/**
	 * Not found error
	 */
	static notFound(resource: string): ApiError {
		return new ApiError(`${resource} not found`, 'NOT_FOUND', 404);
	}

	/**
	 * Validation error with details
	 */
	static validation(message: string, details?: Record<string, unknown>): ApiError {
		return new ApiError(message, 'VALIDATION_ERROR', 400, details);
	}

	/**
	 * Check if error is an ApiError
	 */
	static isApiError(error: unknown): error is ApiError {
		return error instanceof ApiError;
	}
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
	if (ApiError.isApiError(error)) {
		return error.isRetryable;
	}
	return error instanceof TypeError || error instanceof DOMException;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
	if (ApiError.isApiError(error)) {
		return error.message;
	}
	if (error instanceof Error) {
		return error.message;
	}
	return 'An unknown error occurred';
}
