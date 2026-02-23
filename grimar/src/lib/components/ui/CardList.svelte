<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title?: string;
		description?: string;
		class?: string;
		children: Snippet;
	};

	let { title, description, class: className = '', children }: Props = $props();
</script>

<div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden {className}">
	{#if title}
		<div class="border-b border-[var(--color-border)] px-4 py-3">
			<h3 class="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
			{#if description}
				<p class="mt-0.5 text-xs text-[var(--color-text-muted)]">{description}</p>
			{/if}
		</div>
	{/if}
	<div class="divide-y divide-[var(--color-border)]">
		{@render children()}
	</div>
</div>
