<script lang="ts">
	import CompendiumAccordionSection from './CompendiumAccordionSection.svelte';
	import type { CompendiumBenefitsSection } from '$lib/core/types/compendium';

	interface Props {
		section: CompendiumBenefitsSection;
		markdownAt: (path: string) => string;
	}

	let { section, markdownAt }: Props = $props();

	function normalizeLabel(value: string): string {
		return value
			.toLowerCase()
			.replace(/&/g, 'and')
			.replace(/[^a-z0-9\s]/g, ' ')
			.split(/\s+/)
			.filter(Boolean)
			.map((word) => word.replace(/s$/, ''))
			.join(' ');
	}

	function shouldShowItemName(
		groupTitle: string,
		itemName: string | undefined,
		groupSize: number
	): boolean {
		if (!itemName) {
			return false;
		}

		if (groupSize > 1) {
			return true;
		}

		return normalizeLabel(groupTitle) !== normalizeLabel(itemName);
	}
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
				<div class="space-y-5">
					{#each group.items as item, itemIndex (`${group.key}-${item.name ?? 'benefit'}-${itemIndex}`)}
						<div class="border-l border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] pl-4 sm:pl-5">
							{#if shouldShowItemName(group.title, item.name, group.items.length)}
								<h4 class="mb-2 font-serif text-lg text-[var(--color-text-primary)]">{item.name}</h4>
							{/if}
							<div
								class="prose prose-invert prose-sm max-w-none text-[var(--color-text-secondary)] prose-headings:font-serif [&>p:first-child]:mt-0 [&>p:last-child]:mb-0"
							>
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
		<ul class="space-y-3 text-[var(--color-text-secondary)]">
			{#each section.items as item, index (index)}
				<li class="border-l border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] pl-4 prose prose-invert prose-sm max-w-none [&>p]:m-0">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html markdownAt(item.markdownKey)}
				</li>
			{/each}
		</ul>
	</CompendiumAccordionSection>
{/if}
