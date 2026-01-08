<script lang="ts">
	import { Tabs } from 'bits-ui';
	import type { ComponentType, Snippet } from 'svelte';

	export interface NavSection {
		id: string;
		label: string;
		icon: ComponentType;
		description: string;
	}

	type Props = {
		sections: NavSection[];
		activeSection?: string;
		class?: string;
		children?: Snippet<[{ section: NavSection }]>;
	};

	let {
		sections,
		activeSection = $bindable(''),
		class: className = '',
		children
	}: Props = $props();

	function scrollToSection(id: string) {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	function handleTabChange(value: string) {
		activeSection = value;
		scrollToSection(value);
	}
</script>

<div class="relative {className}" aria-label="Settings sections">
	<Tabs.Root
		value={activeSection}
		onValueChange={(v) => v && handleTabChange(v)}
		class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
	>
		<Tabs.List class="contents" aria-label="Settings navigation">
			{#each sections as section (section.id)}
				{@const Icon = section.icon}
				{@const isActive = activeSection === section.id}

				<Tabs.Trigger
					value={section.id}
					class="runestone group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
					data-state={isActive ? 'selected' : 'unselected'}
				>
					<div class="runestone-content">
						<div class="runestone-rune">
							<Icon class="size-5" />
						</div>
						<div class="runestone-label">
							<span class="runestone-label-text">{section.label}</span>
							{#if section.description}
								<span class="runestone-label-desc">{section.description}</span>
							{/if}
						</div>
					</div>
				</Tabs.Trigger>
			{/each}
		</Tabs.List>

		{#if children}
			{#each sections as section (section.id)}
				<Tabs.Content value={section.id} class="contents">
					{@render children({ section })}
				</Tabs.Content>
			{/each}
		{/if}
	</Tabs.Root>
</div>
