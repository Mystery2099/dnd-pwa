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
		<div class="overflow-x-auto">
			<table class="min-w-full border-separate border-spacing-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/45">
				<thead>
					<tr class="bg-[var(--color-bg-card)]/75">
						<th class="sticky left-0 border-b border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3 text-left text-[0.72rem] font-medium tracking-[0.16em] text-[var(--color-text-muted)] uppercase">
							Level
						</th>
						{#each section.columns as column (column.key)}
							<th class="border-b border-[var(--color-border)] px-4 py-3 text-left text-[0.72rem] font-medium tracking-[0.16em] text-[var(--color-text-muted)] uppercase">
								{column.label}
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each section.rows as row (row.level)}
						<tr class="odd:bg-[var(--color-bg-card)]/18">
							<td class="sticky left-0 border-b border-[var(--color-border)] bg-[var(--color-bg-card)]/95 px-4 py-3 font-semibold text-[var(--color-text-primary)]">
								{row.level}
							</td>
							{#each section.columns as column (column.key)}
								<td class="border-b border-[var(--color-border)] px-4 py-3 text-[var(--color-text-secondary)]">
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
