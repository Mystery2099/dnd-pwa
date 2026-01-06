<script lang="ts">
	import type { ComponentType } from 'svelte';

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
	};

	let { sections, activeSection = '', class: className = '' }: Props = $props();

	function scrollToSection(id: string) {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	function handleKeydown(event: KeyboardEvent, index: number) {
		const cards = document.querySelectorAll('[data-settings-nav-card]');
		const currentIndex = index;

		switch (event.key) {
			case 'ArrowRight':
			case 'ArrowDown':
				event.preventDefault();
				const nextIndex = (currentIndex + 1) % sections.length;
				(cards[nextIndex] as HTMLElement)?.focus();
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
				event.preventDefault();
				const prevIndex = (currentIndex - 1 + sections.length) % sections.length;
				(cards[prevIndex] as HTMLElement)?.focus();
				break;
			case 'Home':
				event.preventDefault();
				(cards[0] as HTMLElement)?.focus();
				break;
			case 'End':
				event.preventDefault();
				(cards[sections.length - 1] as HTMLElement)?.focus();
				break;
		}
	}
</script>

<nav class="relative {className}" aria-label="Settings sections">
	<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
		{#each sections as section, index (section.id)}
			{@const isActive = activeSection === section.id}
			{@const Icon = section.icon}

			<button
				type="button"
				class="runestone group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
				data-state={isActive ? 'selected' : 'unselected'}
				data-settings-nav-card="true"
				aria-current={isActive ? 'page' : undefined}
				aria-label="Navigate to {section.label}"
				onclick={() => scrollToSection(section.id)}
				onkeydown={(e) => handleKeydown(e, index)}
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
			</button>
		{/each}
	</div>
</nav>
