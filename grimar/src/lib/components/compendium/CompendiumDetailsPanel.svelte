<script lang="ts">
	import StructuredValue from '$lib/components/ui/StructuredValue.svelte';
	import CompendiumAccordionSection from './CompendiumAccordionSection.svelte';
	import type { CompendiumDetailField } from '$lib/core/types/compendium';

	interface Props {
		fields: CompendiumDetailField[];
		resolveValue: (key: string, value: unknown) => unknown;
	}

	let { fields, resolveValue }: Props = $props();
</script>

{#if fields.length > 0}
	<CompendiumAccordionSection
		title="Details"
		description="Reference fields and structured metadata."
		open={true}
		value="details"
	>
		<dl class="grid gap-3 sm:grid-cols-2">
			{#each fields as field (field.key)}
				<div
					class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/55 p-4 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-overlay-light)_24%,transparent)]"
				>
					<dt
						class="text-[0.72rem] font-medium tracking-[0.16em] text-[var(--color-text-muted)] uppercase"
					>
						{field.label}
					</dt>
					<dd class="mt-2 text-sm text-[var(--color-text-primary)]">
						<StructuredValue value={resolveValue(field.key, field.value)} />
					</dd>
				</div>
			{/each}
		</dl>
	</CompendiumAccordionSection>
{/if}
