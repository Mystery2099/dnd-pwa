<script lang="ts">
	import CompendiumAccordionSection from './CompendiumAccordionSection.svelte';
	import type { CompendiumClassTableSection } from '$lib/core/types/compendium';

	interface Props {
		section: CompendiumClassTableSection;
	}

	let { section }: Props = $props();
</script>

{#if section.columns.length > 0 && section.rows.length > 0}
	<CompendiumAccordionSection
		title={section.title}
		description={section.description}
		open={true}
		value={section.key}
	>
		<div class="glass-scroll min-w-0 max-w-full overflow-x-auto overscroll-x-contain rounded-[1.2rem] border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_54%,transparent),color-mix(in_srgb,var(--color-bg-card)_36%,transparent))]">
			<table class="min-w-[42rem] w-full border-separate border-spacing-0 overflow-hidden rounded-xl bg-[var(--color-bg-card)]/45">
				<thead>
					<tr class="bg-[var(--color-bg-card)]/75">
						<th class="sticky left-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3 text-left text-[0.72rem] font-medium tracking-[0.16em] text-[var(--color-text-muted)] uppercase">
							Level
						</th>
						{#each section.columns as column (column.key)}
							<th class="border-b border-[var(--color-border)] px-4 py-3 text-left text-[0.72rem] font-medium tracking-[0.16em] text-[var(--color-text-muted)] uppercase whitespace-nowrap">
								{column.label}
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each section.rows as row (row.level)}
						<tr class="odd:bg-[var(--color-bg-card)]/18">
							<td class="sticky left-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-bg-card)]/95 px-4 py-3 font-semibold whitespace-nowrap text-[var(--color-text-primary)]">
								{row.level}
							</td>
							{#each section.columns as column (column.key)}
								<td class="border-b border-[var(--color-border)] px-4 py-3 whitespace-nowrap text-[var(--color-text-secondary)]">
									{row.values[column.key] ?? '—'}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</CompendiumAccordionSection>
{/if}
