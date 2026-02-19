<script lang="ts">
	interface LookupItem {
		name: string;
		description?: string;
		details: Record<string, unknown>;
	}

	interface Props {
		items: Record<string, LookupItem[]>;
		title: string;
		icon: string;
		type: string;
		accentColor: string;
		keyField?: string;
		descriptionField?: string;
	}

	let { items, title, icon, type, accentColor, keyField = 'name', descriptionField = 'desc' }: Props =
		$props();

	const displayItems = $derived(items?.[type] ?? []);
</script>

<a
	href="/compendium/{type}"
	class="group relative flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 transition-all duration-300 hover:scale-[1.02] hover:border-[var(--color-accent)]/40 hover:shadow-[0_0_20px_color-mix(in_srgb,var(--color-accent)_20%,transparent)]"
>
	<div class="mb-3 flex items-center justify-between">
		<span class="text-sm font-semibold uppercase tracking-wider {accentColor}">{title}</span>
		<span
			class="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-overlay)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]"
		>
			{displayItems.length}
		</span>
	</div>

	<div class="flex flex-wrap gap-1.5">
		{#each displayItems.slice(0, 8) as item}
			<span
				class="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-overlay)] px-2 py-1 text-xs text-[var(--color-text-secondary)] transition-colors group-hover:border-[var(--color-accent)]/30 group-hover:text-[var(--color-text-primary)]"
			>
				{item[keyField as keyof LookupItem]}
			</span>
		{/each}
		{#if displayItems.length > 8}
			<span class="px-2 py-1 text-xs text-[var(--color-text-muted)]">+{displayItems.length - 8} more</span
			>
		{/if}
	</div>

	{#if displayItems.length === 0}
		<div class="py-4 text-center text-sm text-[var(--color-text-muted)]">No items available</div>
	{/if}
</a>
