<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { Menu, X } from 'lucide-svelte';

	type NavItem = {
		href: string;
		label: string;
	};

	type Props = {
		items?: NavItem[];
		open?: boolean;
	};

	let {
		items = [
			{ href: '/dashboard', label: 'Dashboard' },
			{ href: '/compendium', label: 'Compendium' },
			{ href: '/settings', label: 'Settings' }
		],
		open = $bindable(false)
	}: Props = $props();

	function close() {
		open = false;
	}

	onMount(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (!open) return;
			if (e.key === 'Escape') {
				e.preventDefault();
				close();
			}
		};

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	});
</script>

<div class="md:hidden">
	<button
		type="button"
		class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] shadow-[0_2px_8px_color-mix(in_srgb,black_30%,transparent)] backdrop-blur-sm transition-all duration-200 ease-out hover:border-[var(--color-accent)]/20 hover:bg-[var(--color-bg-card)]"
		aria-label="Open navigation"
		onclick={() => (open = true)}
	>
		<Menu class="size-5" />
	</button>

	{#if open}
		<div class="fixed inset-0 z-100">
			<!-- Backdrop -->
			<button
				type="button"
				class="absolute inset-0 bg-[color-mix(in_srgb,black_60%,transparent)] backdrop-blur-sm"
				aria-label="Close navigation"
				onclick={close}
				transition:fade={{ duration: 150 }}
			></button>

			<!-- Drawer (Obsidian) -->
			<div
				class="absolute top-0 left-0 h-dvh w-[min(85vw,320px)] border-r border-[var(--color-border)] bg-[var(--color-bg-primary)] shadow-[0_0_80px_color-mix(in_srgb,black_80%,transparent)] backdrop-blur-2xl"
				transition:fly={{ x: -16, duration: 180 }}
			>
				<!-- Static Glossy Overlay -->
				<div
					class="pointer-events-none absolute inset-x-0 top-0 h-48 bg-linear-to-br from-[color-mix(in_srgb,var(--color-text-primary)_12%,transparent)] to-transparent opacity-50"
				></div>

				<div
					class="mt-safe-top relative flex items-center justify-between border-b border-[var(--color-border)] p-4"
				>
					<div
						class="text-lg font-bold tracking-tight text-[var(--color-text-primary)] drop-shadow-[0_0_10px_var(--color-accent-glow)]"
					>
						Grimar
					</div>
					<button
						type="button"
						class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] transition-all duration-200 ease-out hover:border-[var(--color-accent)]/20 hover:bg-[var(--color-bg-card)] active:scale-95"
						aria-label="Close navigation"
						onclick={close}
					>
						<X class="size-5" />
					</button>
				</div>

				<nav class="relative p-4">
					<div class="flex flex-col gap-2 text-sm font-medium">
						{#each items as item (item.href)}
							<a
								class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3 text-[var(--color-text-primary)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_5%,transparent)] transition-all duration-200 ease-out hover:border-[var(--color-accent)]/20 hover:bg-[var(--color-bg-card)]"
								href={item.href}
								onclick={(e) => {
									// Handle navigation with proper SvelteKit routing
									const target = e.currentTarget as HTMLAnchorElement;
									const url = new URL(target.href, window.location.origin);
									if (window.location.pathname !== url.pathname) {
										import('$app/navigation').then(({ goto }) => {
											goto(url.pathname).catch(() => {});
										});
									}
									e.preventDefault();
									close();
								}}
							>
								{item.label}
							</a>
						{/each}
					</div>
				</nav>
			</div>
		</div>
	{/if}
</div>
