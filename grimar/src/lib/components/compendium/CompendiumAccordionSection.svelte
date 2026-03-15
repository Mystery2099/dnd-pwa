<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		Accordion,
		AccordionItem,
		AccordionTrigger,
		AccordionContent
	} from '$lib/components/ui/accordion';

	interface Props {
		title: string;
		description?: string;
		value?: string;
		open?: boolean;
		children?: Snippet;
	}

	let { title, description, value = 'section', open = false, children }: Props = $props();

	let activeValue = $derived(open ? value : '');
</script>

<div
	class="overflow-hidden rounded-[1.5rem] border border-[var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_82%,transparent),color-mix(in_srgb,var(--color-bg-card)_58%,transparent))] shadow-[0_1.25rem_3rem_color-mix(in_srgb,var(--color-shadow)_18%,transparent)]"
>
	<Accordion bind:value={activeValue} class="w-full">
		<AccordionItem {value} class="border-none">
			<AccordionTrigger class="gap-4 px-5 py-4 hover:no-underline sm:px-6">
				<div class="min-w-0 text-left">
					<p class="text-lg font-semibold text-[var(--color-text-primary)]">{title}</p>
					{#if description}
						<p class="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p>
					{/if}
				</div>
			</AccordionTrigger>
			<AccordionContent class="px-5 pb-5 sm:px-6 sm:pb-6">
				{@render children?.()}
			</AccordionContent>
		</AccordionItem>
	</Accordion>
</div>
