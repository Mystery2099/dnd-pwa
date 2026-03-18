<script lang="ts">
	import { resolveCompendiumLink } from '$lib/core/utils/compendium-links';
	import { isCompendiumDetailReference } from '$lib/core/utils/compendium-detail-values';
	import StructuredValue from './StructuredValue.svelte';
	import { formatFieldName } from '$lib/utils/compendium';

	interface Props {
		value: unknown;
		depth?: number;
	}

	let { value, depth = 0 }: Props = $props();

	type CompendiumLink = {
		label: string;
		href: string;
		meta?: string;
		isExternal?: boolean;
	};

	function isUrlLikeString(input: string): boolean {
		try {
			const url = new URL(input);
			return url.protocol === 'http:' || url.protocol === 'https:';
		} catch {
			return false;
		}
	}

	function getEntries(input: Record<string, unknown>): Array<[string, unknown]> {
		return Object.entries(input).filter(([, entryValue]) => {
			if (entryValue === null || entryValue === undefined) return false;
			if (typeof entryValue === 'string') return entryValue.trim().length > 0;
			if (Array.isArray(entryValue)) return entryValue.length > 0;
			if (typeof entryValue === 'object') return Object.keys(entryValue).length > 0;
			return true;
		});
	}

	function isStructuredEntry(entry: unknown): boolean {
		return typeof entry === 'object' && entry !== null;
	}

	function isExternalLink(
		input: CompendiumLink | { href: string; label: string; meta?: string }
	): input is CompendiumLink {
		return 'isExternal' in input && input.isExternal === true;
	}

	function getCompendiumLinkFromUrl(
		input: string,
		preferredLabel?: string,
		meta?: string
	): CompendiumLink | null {
		const resolvedLink = resolveCompendiumLink(input, preferredLabel, meta);
		if (!resolvedLink) {
			return null;
		}

		return {
			label: resolvedLink.label,
			href: resolvedLink.href,
			meta: resolvedLink.meta
		};
	}

	function getLinkedObject(input: unknown): CompendiumLink | null {
		if (!input || typeof input !== 'object' || Array.isArray(input)) return null;

		const record = input as Record<string, unknown>;
		if (typeof record.url !== 'string' || !record.url.trim()) return null;

		const label =
			(typeof record.name === 'string' && record.name.trim()) ||
			(typeof record.key === 'string' && record.key.trim()) ||
			record.url;

		const normalizedLabel = label
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '');
		const normalizedKey =
			typeof record.key === 'string'
				? record.key
						.trim()
						.toLowerCase()
						.replace(/[^a-z0-9]+/g, '')
				: '';

		const meta =
			typeof record.key === 'string' &&
			record.key.trim() &&
			record.key !== label &&
			normalizedKey !== normalizedLabel
				? record.key
				: undefined;

		const internalCompendiumLink = getCompendiumLinkFromUrl(record.url, label, meta);
		if (internalCompendiumLink) {
			return internalCompendiumLink;
		}

		return {
			label,
			href: record.url,
			meta,
			isExternal: true
		};
	}
</script>

{#if value === null || value === undefined}
	<span class="text-[var(--color-text-muted)]">—</span>
{:else if typeof value === 'boolean'}
	<span>{value ? 'Yes' : 'No'}</span>
{:else if typeof value === 'number'}
	<span>{value.toLocaleString()}</span>
{:else if typeof value === 'string'}
	{@const internalCompendiumLink = getCompendiumLinkFromUrl(value)}
	{#if internalCompendiumLink}
		<a
			href={internalCompendiumLink.href}
			class="break-words text-accent transition-colors hover:text-accent/80"
		>
			{internalCompendiumLink.label}
		</a>
	{:else if isUrlLikeString(value)}
		<a
			href={value}
			target="_blank"
			rel="noreferrer"
			class="break-all text-accent transition-colors hover:text-accent/80"
		>
			{value}
		</a>
	{:else}
		<span class="break-words whitespace-pre-wrap">{value}</span>
	{/if}
{:else if Array.isArray(value)}
	<ul class="space-y-2">
		{#each value as entry, index (index)}
			{@const structuredEntry = isStructuredEntry(entry)}
			<li
				class={`${
					structuredEntry
						? 'rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/35 p-3'
						: ''
				} ${depth > 0 ? 'text-[var(--color-text-secondary)]' : ''}`}
			>
				<StructuredValue value={entry} depth={depth + 1} />
			</li>
		{/each}
	</ul>
{:else if typeof value === 'object'}
	{@const entityValue = isCompendiumDetailReference(value) ? value : null}
	{@const linkedObject = entityValue ?? getLinkedObject(value)}
	{#if linkedObject}
		{@const externalLink = isExternalLink(linkedObject)}
		<div class="space-y-1">
			<a
				href={linkedObject.href}
				target={externalLink ? '_blank' : undefined}
				rel={externalLink ? 'noreferrer' : undefined}
				class="break-words text-accent transition-colors hover:text-accent/80"
			>
				{linkedObject.label}
			</a>
			{#if linkedObject.meta}
				<div class="text-xs text-[var(--color-text-muted)] uppercase">{linkedObject.meta}</div>
			{/if}
		</div>
	{:else}
		{@const entries = getEntries(value as Record<string, unknown>)}
		{#if entries.length === 0}
			<span class="text-[var(--color-text-muted)]">—</span>
		{:else}
			<dl class="space-y-2">
				{#each entries as [entryKey, entryValue] (entryKey)}
					<div
						class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/35 p-3"
					>
						<dt class="text-xs font-medium text-[var(--color-text-muted)] uppercase">
							{formatFieldName(entryKey)}
						</dt>
						<dd class="mt-1 text-sm text-[var(--color-text-primary)]">
							<StructuredValue value={entryValue} depth={depth + 1} />
						</dd>
					</div>
				{/each}
			</dl>
		{/if}
	{/if}
{:else}
	<span>{String(value)}</span>
{/if}
