<script lang="ts">
	import {
		Accordion,
		AccordionItem,
		AccordionTrigger,
		AccordionContent
	} from '$lib/components/ui/accordion';
	import CompendiumAccordionSection from './CompendiumAccordionSection.svelte';
	import type { CompendiumClassFeatureEntry } from '$lib/core/types/compendium';

	interface Props {
		features: CompendiumClassFeatureEntry[];
		title?: string;
		description?: string;
		defaultOpen?: boolean;
		markdownAt: (path: string) => string;
	}

	let {
		features,
		title = 'Class Features',
		description,
		defaultOpen = true,
		markdownAt
	}: Props = $props();
	let activeFeature = $state('');
</script>

{#if features.length > 0}
	<CompendiumAccordionSection {title} {description} value="class-features" open={defaultOpen}>
		<Accordion
			bind:value={activeFeature}
			class="divide-y divide-[color-mix(in_srgb,var(--color-border)_82%,transparent)] border-t border-[color-mix(in_srgb,var(--color-border)_72%,transparent)]"
		>
			{#each features as feature, index (`${feature.key ?? feature.name ?? 'feature'}-${index}`)}
				{@const featureValue = String(feature.key || feature.name || `feature-${index}`)}
				<AccordionItem value={featureValue} class="border-none">
					<AccordionTrigger class="py-4 hover:no-underline">
						<span class="mr-3 text-left font-serif text-xl text-[var(--color-text-primary)]">
							{feature.name || feature.key}
						</span>
						{#if feature.level !== undefined}
							<span class="text-xs tracking-[0.18em] text-[var(--color-text-muted)] uppercase">
								Level {feature.level}
							</span>
						{/if}
					</AccordionTrigger>
					<AccordionContent class="pb-5">
						{#if feature.markdownKey && activeFeature === featureValue}
							<div
								class="border-l border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] pl-4 prose prose-invert prose-sm max-w-none text-[var(--color-text-secondary)] prose-headings:font-serif"
							>
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html markdownAt(feature.markdownKey)}
							</div>
						{/if}
					</AccordionContent>
				</AccordionItem>
			{/each}
		</Accordion>
	</CompendiumAccordionSection>
{/if}
