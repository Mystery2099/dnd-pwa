<script lang="ts">
	import CompendiumAccordionSection from './CompendiumAccordionSection.svelte';
	import type { CompendiumBenefitsSection } from '$lib/core/types/compendium';

	interface Props {
		section: CompendiumBenefitsSection;
		markdownAt: (path: string) => string;
	}

	let { section, markdownAt }: Props = $props();
</script>

<CompendiumAccordionSection
	title={section.title}
	description={section.description}
	value={section.key}
>
	{#if section.layout === 'grouped'}
		<div class="space-y-5">
			{#each section.groups as group (group.key)}
				<section class="space-y-3">
					<div class="flex items-center gap-3">
						<div class="h-px flex-1 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-border)_15%,transparent),var(--color-border),transparent)]"></div>
						<h3 class="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-muted)]">
							{group.title}
						</h3>
						<div class="h-px flex-1 bg-[linear-gradient(90deg,transparent,var(--color-border),color-mix(in_srgb,var(--color-border)_15%,transparent))]"></div>
					</div>

					<div class="grid gap-3">
						{#each group.items as item, index (`${group.key}-${item.name ?? 'benefit'}-${index}`)}
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
				</section>
			{/each}
		</div>
	{:else}
		<ul class="list-inside list-disc space-y-2 text-[var(--color-text-secondary)]">
			{#each section.items as item, index (index)}
				<li class="prose prose-invert prose-sm max-w-none [&>p]:m-0">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html markdownAt(item.markdownKey)}
				</li>
			{/each}
		</ul>
	{/if}
</CompendiumAccordionSection>
