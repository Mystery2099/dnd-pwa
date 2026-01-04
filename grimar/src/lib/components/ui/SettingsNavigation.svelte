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

<nav class="settings-navigation {className}" aria-label="Settings sections">
	<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
		{#each sections as section, index (section.id)}
			{@const isActive = activeSection === section.id}
			{@const Icon = section.icon}

			<button
				type="button"
				class="settings-nav-card group"
				data-active={isActive}
				data-settings-nav-card="true"
				aria-current={isActive ? 'page' : undefined}
				aria-label="Navigate to {section.label}"
				onclick={() => scrollToSection(section.id)}
				onkeydown={(e) => handleKeydown(e, index)}
			>
				<div class="flex items-start gap-3">
					<div class="settings-nav-icon shrink-0">
						<Icon class="size-5" />
					</div>
					<div class="min-w-0 flex-1 text-left">
						<div class="settings-nav-label">{section.label}</div>
						{#if section.description}
							<div class="settings-nav-description">{section.description}</div>
						{/if}
					</div>
				</div>
			</button>
		{/each}
	</div>
</nav>

<style>
	.settings-navigation {
		position: relative;
	}

	/* Settings Navigation Card - Mini Runestone Style */
	.settings-nav-card {
		position: relative;
		background: linear-gradient(
			145deg,
			color-mix(in srgb, var(--color-bg-card) 80%, transparent) 0%,
			color-mix(in srgb, black 20%, transparent) 100%
		);
		border: 1px solid var(--color-border);
		border-radius: 0.75rem;
		padding: 1rem;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		text-align: left;
		overflow: hidden;
		text-decoration: none;
		color: inherit;
	}

	/* Chiseled edge effect */
	.settings-nav-card::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 0.75rem;
		padding: 1px;
		background: linear-gradient(
			145deg,
			color-mix(in srgb, var(--color-text-primary) 20%, transparent),
			transparent 50%,
			color-mix(in srgb, black 30%, transparent)
		);
		-webkit-mask:
			linear-gradient(#fff 0 0) content-box,
			linear-gradient(#fff 0 0);
		mask:
			linear-gradient(#fff 0 0) content-box,
			linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		pointer-events: none;
	}

	.settings-nav-card:hover {
		transform: translatey(-2px);
		border-color: var(--color-border-hover);
	}

	.settings-nav-card:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.settings-nav-card[data-active='true'] {
		background: linear-gradient(
			145deg,
			color-mix(in srgb, var(--color-accent) 12%, transparent) 0%,
			color-mix(in srgb, var(--color-accent) 5%, transparent) 100%
		);
		border-color: var(--color-accent);
		box-shadow:
			0 4px 16px color-mix(in srgb, var(--color-accent) 25%, transparent),
			inset 0 0 12px color-mix(in srgb, var(--color-accent) 8%, transparent);
	}

	.settings-nav-card[data-active='true']::before {
		background: linear-gradient(
			145deg,
			color-mix(in srgb, var(--color-accent) 40%, transparent),
			transparent 50%,
			color-mix(in srgb, var(--color-accent) 40%, transparent)
		);
	}

	.settings-nav-icon {
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-muted);
		transition: all 0.3s ease;
	}

	.settings-nav-card:hover .settings-nav-icon,
	.settings-nav-card[data-active='true'] .settings-nav-icon {
		color: var(--color-accent);
		text-shadow: 0 0 8px var(--color-accent-glow);
	}

	.settings-nav-label {
		display: block;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
		transition: color 0.2s ease;
	}

	.settings-nav-card:hover .settings-nav-label,
	.settings-nav-card[data-active='true'] .settings-nav-label {
		color: var(--color-accent);
	}

	.settings-nav-description {
		display: block;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		margin-top: 0.125rem;
		line-height: 1.4;
	}

	/* Active state glow animation */
	@keyframes nav-card-pulse {
		0%,
		100% {
			box-shadow:
				0 4px 16px color-mix(in srgb, var(--color-accent) 25%, transparent),
				inset 0 0 12px color-mix(in srgb, var(--color-accent) 8%, transparent);
		}
		50% {
			box-shadow:
				0 4px 20px color-mix(in srgb, var(--color-accent) 35%, transparent),
				inset 0 0 16px color-mix(in srgb, var(--color-accent) 12%, transparent);
		}
	}

	.settings-nav-card[data-active='true'] {
		animation: nav-card-pulse 3s ease-in-out infinite;
	}
</style>
