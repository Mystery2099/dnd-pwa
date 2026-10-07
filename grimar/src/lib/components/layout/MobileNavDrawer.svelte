<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { onMount } from 'svelte';
	import { Menu, X } from 'lucide-svelte';
	import logoUrl from '$lib/assets/grimar-hermetica-title.webp';

	type NavItem = {
		href: string;
		label: string;
		disabled?: boolean;
	};

	type Props = {
		items?: NavItem[];
		open?: boolean;
	};

	let {
		items = [
			{ href: '/dashboard', label: 'Dashboard' },
			{ href: '/compendium', label: 'Compendium' },
			{ href: '/characters', label: 'Characters' },
			{ href: '/forge', label: 'The Forge', disabled: true },
			{ href: '/settings', label: 'Settings' }
		],
		open = $bindable(false)
	}: Props = $props();

	let ready = $state(false);

	function close() {
		open = false;
	}
	onMount(() => {
		ready = true;
		const desktop = window.matchMedia('(min-width: 48rem)');
		const closeOnDesktop = () => {
			if (desktop.matches) close();
		};
		closeOnDesktop();
		desktop.addEventListener('change', closeOnDesktop);
		return () => desktop.removeEventListener('change', closeOnDesktop);
	});
</script>

<Dialog.Root bind:open>
	<div class="md:hidden">
		<Dialog.Trigger
			disabled={!ready}
			class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] shadow-[0_2px_8px_color-mix(in_srgb,black_30%,transparent)] backdrop-blur-sm transition-all duration-200 ease-out hover:border-[var(--color-accent)]/20 hover:bg-[var(--color-bg-card)]"
			aria-label="Open navigation"
		>
			<Menu class="size-5" />
		</Dialog.Trigger>

		<Dialog.Portal>
			<!-- Backdrop -->
			<Dialog.Overlay class="fixed inset-0 z-100 bg-[var(--color-overlay-dark)] backdrop-blur-sm" />

			<!-- Drawer (Obsidian) -->
			<Dialog.Content
				class="fixed top-0 left-0 z-100 h-dvh w-[min(85vw,320px)] overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-bg-primary)] shadow-[0_0_80px_var(--color-shadow)] backdrop-blur-2xl"
			>
				<Dialog.Title class="sr-only">Navigation</Dialog.Title>
				<Dialog.Description class="sr-only">Choose a page in your Grimoire.</Dialog.Description>
				<!-- Static Glossy Overlay -->
				<div
					class="pointer-events-none absolute inset-x-0 top-0 h-48 bg-linear-to-br from-[color-mix(in_srgb,var(--color-text-primary)_12%,transparent)] to-transparent opacity-50"
				></div>

				<div
					class="mt-safe-top relative flex items-center justify-between border-b border-[var(--color-border)] p-4"
				>
					<img src={logoUrl} alt="Grimar" class="h-7 w-auto" />
					<Dialog.Close
						class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] transition-all duration-200 ease-out hover:border-[var(--color-accent)]/20 hover:bg-[var(--color-bg-card)] active:scale-95"
						aria-label="Close navigation"
					>
						<X class="size-5" />
					</Dialog.Close>
				</div>

				<nav class="relative p-4">
					<div class="flex flex-col gap-2 text-sm font-medium">
						{#each items as item (item.href)}
							{#if item.disabled}
								<span
									class="pointer-events-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3 text-[var(--color-text-primary)] opacity-50"
								>
									{item.label}
								</span>
							{:else}
								<a
									class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3 text-[var(--color-text-primary)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_5%,transparent)] transition-all duration-200 ease-out hover:border-[var(--color-accent)]/20 hover:bg-[var(--color-bg-card)]"
									href={item.href}
									onclick={close}
								>
									{item.label}
								</a>
							{/if}
						{/each}
					</div>
				</nav>
			</Dialog.Content>
		</Dialog.Portal>
	</div>
</Dialog.Root>
