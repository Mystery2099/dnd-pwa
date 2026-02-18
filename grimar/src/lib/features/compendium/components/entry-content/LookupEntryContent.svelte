<script lang="ts">
	interface Props {
		details: Record<string, unknown>;
		type: 'skills' | 'conditions' | 'languages' | 'alignments';
	}

	let { details, type }: Props = $props();

	const isExotic = $derived(details?.is_exotic === true);
	const isSecret = $derived(details?.is_secret === true);
	const ability = $derived(details?.ability as string | undefined);
	const description = $derived(details?.desc as string | undefined);
	const script = $derived(details?.script_language as string | undefined);
</script>

<div class="space-y-4 text-[var(--color-text-primary)]">
	{#if type === 'skills'}
		<div class="flex items-center gap-3">
			{#if ability}
				<span
					class="rounded-md bg-[var(--color-accent)]/20 px-2 py-1 text-sm font-medium text-[var(--color-accent)]"
				>
					{ability}
				</span>
			{/if}
			<span class="text-sm text-[var(--color-text-muted)]">
				Ability Check
			</span>
		</div>
	{:else if type === 'languages'}
		<div class="flex flex-wrap gap-2">
			{#if isExotic}
				<span
					class="rounded-md bg-[var(--color-gem-topaz)]/20 px-2 py-1 text-xs font-medium text-[var(--color-gem-topaz)]"
				>
					Exotic
				</span>
			{/if}
			{#if isSecret}
				<span
					class="rounded-md bg-[var(--color-gem-amethyst)]/20 px-2 py-1 text-xs font-medium text-[var(--color-gem-amethyst)]"
				>
					Secret
				</span>
			{/if}
			{#if script}
				<span class="text-sm text-[var(--color-text-muted)]">
					Script: {script}
				</span>
			{/if}
		</div>
	{/if}

	{#if description}
		<div class="prose prose-invert prose-sm max-w-none">
			<p>{description}</p>
		</div>
	{/if}

	{#if type === 'skills' && details?.check && typeof details.check === 'string'}
		<div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3">
			<h4 class="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
				Sample Check
			</h4>
			<p class="text-sm">{details.check}</p>
		</div>
	{/if}

	{#if type === 'skills' && details?.action && typeof details.action === 'string'}
		<div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3">
			<h4 class="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
				Sample Action
			</h4>
			<p class="text-sm">{details.action}</p>
		</div>
	{/if}
</div>
