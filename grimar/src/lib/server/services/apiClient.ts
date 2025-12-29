const BASE_URL = 'https://api.open5e.com/v1';

export type Open5eListResponse<T> = {
	results: T[];
	next: string | null;
};

export interface ApiClientOptions {
	timeout?: number;
	retries?: number;
}

export class ApiClient {
	private baseUrl: string;
	private defaultOptions: ApiClientOptions;

	constructor(baseUrl: string = BASE_URL, options: ApiClientOptions = {}) {
		this.baseUrl = baseUrl;
		this.defaultOptions = {
			timeout: 30000, // 30 seconds
			retries: 3,
			...options
		};
	}

	/**
	 * Fetch all pages of a paginated endpoint
	 */
	async fetchAllPages<T>(endpoint: string): Promise<T[]> {
		let nextUrl: string | null = `${this.baseUrl}${endpoint}`;
		const results: T[] = [];

		while (nextUrl) {
			const responseData: Open5eListResponse<T> =
				await this.fetchWithRetry<Open5eListResponse<T>>(nextUrl);
			results.push(...responseData.results);
			nextUrl = responseData.next;
		}

		return results;
	}

	/**
	 * Fetch a single page
	 */
	async fetchPage<T>(endpoint: string): Promise<Open5eListResponse<T>> {
		return this.fetchWithRetry<Open5eListResponse<T>>(`${this.baseUrl}${endpoint}`);
	}

	/**
	 * Fetch single item
	 */
	async fetchItem<T>(endpoint: string): Promise<T> {
		return this.fetchWithRetry<T>(`${this.baseUrl}${endpoint}`);
	}

	/**
	 * Generic fetch with retry logic
	 */
	private async fetchWithRetry<T>(url: string, attempt: number = 1): Promise<T> {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), this.defaultOptions.timeout);

			const response = await fetch(url, {
				signal: controller.signal
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			return (await response.json()) as T;
		} catch (error) {
			if (attempt < this.defaultOptions.retries!) {
				console.warn(
					`[ApiClient] Retrying (${attempt}/${this.defaultOptions.retries}): ${(error as Error).message}`
				);
				// Exponential backoff
				await this.delay(Math.pow(2, attempt) * 1000);
				return this.fetchWithRetry<T>(url, attempt + 1);
			}
			throw error;
		}
	}

	/**
	 * Simple delay utility
	 */
	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

// Default instance
export const apiClient = new ApiClient();
