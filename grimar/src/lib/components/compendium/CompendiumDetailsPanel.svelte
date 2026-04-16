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
		<dl
			class="divide-y divide-[color-mix(in_srgb,var(--color-border)_74%,transparent)] rounded-[1.75rem] border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_62%,transparent),color-mix(in_srgb,var(--color-bg-card)_34%,transparent))] px-5 py-3 shadow-[0_1.25rem_3rem_color-mix(in_srgb,var(--color-shadow)_10%,transparent)]"
		>
			{#each fields as field (field.key)}
				<div class="py-3 first:pt-1 last:pb-1">
					<dt class="text-[0.7rem] tracking-[0.18em] text-[var(--color-text-muted)] uppercase">
						{field.label}
					</dt>
					<dd class="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">
						<StructuredValue value={resolveValue(field.key, field.value)} />
					</dd>
				</div>
			{/each}
		</dl>
	</CompendiumAccordionSection>
{/if}
