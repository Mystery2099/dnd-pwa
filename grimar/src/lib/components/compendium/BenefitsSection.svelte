<script lang="ts">
	import CompendiumAccordionSection from './CompendiumAccordionSection.svelte';
	import type { CompendiumBenefitsSection } from '$lib/core/types/compendium';

	interface Props {
		section: CompendiumBenefitsSection;
		markdownAt: (path: string) => string;
	}

	let { section, markdownAt }: Props = $props();
</script>

{#if section.layout === 'grouped'}
	<div class="space-y-4">
		{#each section.groups as group, index (group.key)}
			<CompendiumAccordionSection
				title={group.title}
				description={index === 0 ? section.description : undefined}
				value={`${section.key}-${group.key}`}
				open={index < 2}
			>
				<div class="grid gap-3">
					{#each group.items as item, itemIndex (`${group.key}-${item.name ?? 'benefit'}-${itemIndex}`)}
						<div
							class="rounded-[1.25rem] border border-[var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_76%,transparent),color-mix(in_srgb,var(--color-bg-card)_54%,transparent))] p-4 shadow-[0_0.75rem_2rem_color-mix(in_srgb,var(--color-shadow)_12%,transparent)]"
						>
							{#if item.name}
								<h4 class="mb-2 text-sm font-semibold text-accent">{item.name}</h4>
							{/if}
							<div class="prose prose-invert prose-sm max-w-none text-[var(--color-text-secondary)] [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html markdownAt(item.markdownKey)}
							</div>
						</div>
					{/each}
				</div>
			</CompendiumAccordionSection>
		{/each}
	</div>
{:else}
	<CompendiumAccordionSection
		title={section.title}
		description={section.description}
		value={section.key}
	>
		<ul class="list-inside list-disc space-y-2 text-[var(--color-text-secondary)]">
			{#each section.items as item, index (index)}
				<li class="prose prose-invert prose-sm max-w-none [&>p]:m-0">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html markdownAt(item.markdownKey)}
				</li>
			{/each}
		</ul>
	</CompendiumAccordionSection>
{/if}
