<script lang="ts">
	import {
		Accordion,
		AccordionItem,
		AccordionTrigger,
		AccordionContent
	} from '$lib/components/ui/accordion';
	import CompendiumAccordionSection from './CompendiumAccordionSection.svelte';

	type Feature = {
		key?: string;
		name?: string;
		desc?: string;
		gained_at?: { level?: number } | Array<{ level?: number }>;
	};

	interface Props {
		features: Feature[];
		markdownAt: (path: string) => string;
	}

	let { features, markdownAt }: Props = $props();
	let activeFeature = $state('');
</script>

{#if features.length > 0}
	<CompendiumAccordionSection
		title="Class Features"
		description="Expandable feature entries grouped by the class progression."
		value="class-features"
		open={true}
	>
		<Accordion
			bind:value={activeFeature}
			class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/55 px-4"
		>
			{#each features as feature, index (`${feature.key ?? feature.name ?? 'feature'}-${index}`)}
				{@const featureValue = String(feature.key || feature.name || `feature-${index}`)}
				<AccordionItem value={featureValue} class="border-[var(--color-border)]">
					<AccordionTrigger class="py-3 hover:no-underline">
						<span class="mr-3 text-left font-semibold text-accent">
							{feature.name || feature.key}
						</span>
						{#if feature.gained_at}
							<span class="text-xs text-[var(--color-text-muted)]">
								{#if Array.isArray(feature.gained_at)}
									Level {feature.gained_at[0]?.level ?? '?'}
								{:else}
									Level {feature.gained_at.level ?? '?'}
								{/if}
							</span>
						{/if}
					</AccordionTrigger>
					<AccordionContent>
						{#if feature.desc && activeFeature === featureValue}
							<div class="prose prose-invert prose-sm max-w-none text-[var(--color-text-secondary)]">
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html markdownAt(`features.${index}.desc`)}
							</div>
						{/if}
					</AccordionContent>
				</AccordionItem>
			{/each}
		</Accordion>
	</CompendiumAccordionSection>
{/if}
