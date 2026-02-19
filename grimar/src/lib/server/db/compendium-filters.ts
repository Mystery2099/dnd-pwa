/**
 * Server-only Compendium Filter Utilities
 *
 * SQL helper functions for building compendium queries.
 * Client-safe constants moved to $lib/core/constants/compendium/type-mappings.ts
 */

import { sql } from 'drizzle-orm';
import { compendiumItems } from './schema';
import {
	JSON_PATHS,
	FILTER_PARAMS,
	DB_TYPES,
	PATH_TO_DB_TYPE,
	DB_TYPE_TO_PATH,
	SECTION_TO_SINGULAR,
	SECTION_TO_TYPE_FILTER,
	normalizeDbType,
	getUrlPath,
	type DbType
} from '$lib/core/constants/compendium/type-mappings';

export {
	JSON_PATHS,
	FILTER_PARAMS,
	DB_TYPES,
	PATH_TO_DB_TYPE,
	DB_TYPE_TO_PATH,
	SECTION_TO_SINGULAR,
	SECTION_TO_TYPE_FILTER,
	normalizeDbType,
	getUrlPath,
	type DbType
};

export function jsonExtract(path: string) {
	return sql`json_extract(${compendiumItems.details}, ${path})`;
}

export function jsonExtractLower(path: string) {
	return sql`lower(json_extract(${compendiumItems.details}, ${path}))`;
}

export function buildJsonFilter(path: string, value: string) {
	return sql`${jsonExtractLower(path)} = ${value.toLowerCase()}`;
}

export function buildJsonExactFilter(path: string, value: string | number) {
	return sql`${jsonExtract(path)} = ${value}`;
}
