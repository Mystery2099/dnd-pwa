<script lang="ts">
	import type { SectionConfig, FieldConfig } from './types';

	interface Props {
		details: Record<string, unknown>;
		sections: SectionConfig[];
		descriptionKey?: string;
	}

	let { details, sections, descriptionKey = 'desc' }: Props = $props();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let SvelteMarkdown: any = $state(null);
	let markdownError = $state(false);

	$effect(() => {
		if (details[descriptionKey]) {
			import('svelte-markdown').then((mod) => {
				SvelteMarkdown = mod.default;
			}).catch(() => {
				markdownError = true;
			});
		}
	});

	function formatValue(value: unknown, field: FieldConfig): string {
		if (value === undefined || value === null) return '—';
		if (field.format) return field.format(value);

		switch (field.type) {
			case 'array':
				return Array.isArray(value) ? value.join(', ') : String(value);
			case 'boolean':
				return value ? 'Yes' : 'No';
			default:
				return String(value);
		}
	}

	function getDescription(): string {
		const desc = details[descriptionKey];
		if (Array.isArray(desc)) return desc.join('\n\n');
		if (typeof desc === 'string') return desc;
		return '';
	}

	function getListItems(field: FieldConfig): Array<{ name?: string; desc?: string }> {
		const value = details[field.key];
		if (!Array.isArray(value)) return [];
		if (field.listKey) {
			return value.map((item) => ({
				name: item[field.listKey!] || item.name,
				desc: item.desc || item.description
			}));
		}
		return value;
	}

	function getObjectValue(field: FieldConfig): Record<string, unknown> | null {
		const value = details[field.key];
		if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			return value as Record<string, unknown>;
		}
		return null;
	}
</script>

<div class="space-y-6">
	{#each sections as section}
		{#if section.title}
			<h3 class="text-lg font-semibold text-[var(--color-text)]">{section.title}</h3>
		{/if}

		{#if section.fields.some((f) => f.type === 'list' || f.type === 'object')}
			{#each section.fields as field}
				{#if field.type === 'list'}
					{@const items = getListItems(field)}
					{#if items.length > 0}
						<div class="space-y-3">
							{#if field.label}
								<h4 class="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
									{field.label}
								</h4>
							{/if}
							{#each items as item}
								<div class="card p-4">
									{#if item.name}
										<h5 class="font-semibold text-[var(--color-text)]">{item.name}</h5>
									{/if}
									{#if item.desc}
										<div class="prose prose-invert prose-sm max-w-none mt-2">
											{#if SvelteMarkdown}
												<SvelteMarkdown source={item.desc} />
											{:else if markdownError}
												<p class="whitespace-pre-wrap">{item.desc}</p>
											{/if}
										</div>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				{:else if field.type === 'object'}
					{@const obj = getObjectValue(field)}
					{#if obj}
						<div class="card p-4 border-l-4 border-[var(--color-accent)]">
							{#if field.label}
								<h4 class="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
									{field.label}
								</h4>
							{/if}
							{#if obj.name}
								<h5 class="font-semibold text-[var(--color-text)]">{obj.name}</h5>
							{/if}
							{#if obj.desc}
								<div class="prose prose-invert prose-sm max-w-none mt-2">
									{#if SvelteMarkdown}
										<SvelteMarkdown source={String(obj.desc)} />
									{:else if markdownError}
										<p class="whitespace-pre-wrap">{String(obj.desc)}</p>
									{/if}
								</div>
							{/if}
						</div>
					{/if}
				{/if}
			{/each}
		{:else}
			<div class="grid grid-cols-2 md:grid-cols-{section.columns || 4} gap-3">
				{#each section.fields as field}
					{@const value = details[field.key]}
					{#if value !== undefined && value !== null}
						<div class="card p-3">
							<span class="text-xs text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">
								{field.label}
							</span>
							<span class="text-[var(--color-text)]">{formatValue(value, field)}</span>
						</div>
					{/if}
				{/each}
			</div>
		{/if}
	{/each}

	{#if getDescription()}
		<div class="prose prose-invert max-w-none">
			{#if SvelteMarkdown}
				<SvelteMarkdown source={getDescription()} />
			{:else if markdownError}
				<div class="whitespace-pre-wrap">{getDescription()}</div>
			{:else}
				<div class="animate-pulse text-[var(--color-text-muted)]">Loading...</div>
			{/if}
		</div>
	{/if}
</div>
