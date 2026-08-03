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
	class="border-t border-[color-mix(in_srgb,var(--color-border)_78%,transparent)] pt-6 first:border-t-0 first:pt-0"
>
	<Accordion bind:value={activeValue} class="w-full">
		<AccordionItem {value} class="border-none">
			<AccordionTrigger class="gap-4 px-0 py-0 hover:no-underline">
				<div class="min-w-0 border-l border-accent/35 pl-4 text-left sm:pl-6">
					<p class="font-serif text-[1.45rem] leading-tight text-[var(--color-text-primary)]">
						{title}
					</p>
					{#if description}
						<p class="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
							{description}
						</p>
					{/if}
				</div>
			</AccordionTrigger>
			<AccordionContent class="mt-5 px-0 pb-1">
				{@render children?.()}
			</AccordionContent>
		</AccordionItem>
	</Accordion>
</div>
