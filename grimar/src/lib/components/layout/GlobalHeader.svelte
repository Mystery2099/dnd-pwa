<script lang="ts">
	import type { Snippet } from 'svelte';
	import Omnibar from '$lib/components/layout/Omnibar.svelte';
	import PrimaryNav from '$lib/components/layout/PrimaryNav.svelte';
	import MobileNavDrawer from '$lib/components/layout/MobileNavDrawer.svelte';

	type Props = {
		title?: string;
		homeHref?: string;
		center?: Snippet;
		right?: Snippet;
	};

	let { title = 'Grimar', homeHref = '/dashboard', center, right }: Props = $props();
	let mobileNavOpen = $state(false);
</script>

<div class="relative flex items-center justify-between gap-4">
	<div class="flex min-w-0 items-center gap-3">
		<MobileNavDrawer bind:open={mobileNavOpen} />
		<!-- Aero Title -->
		<a
			class="truncate bg-linear-to-b from-[var(--color-text-primary)] via-[var(--color-text-primary)] to-[color-mix(in_srgb,var(--color-text-primary)_50%,var(--color-accent))] bg-clip-text text-2xl font-black tracking-tighter text-transparent drop-shadow-[0_0_10px_var(--color-accent-glow)] transition duration-300 hover:drop-shadow-[0_0_15px_var(--color-accent-glow)]"
			href={homeHref}
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
			}}
		>
			{title}
		</a>
	</div>

	<div class="hidden max-w-xl flex-1 md:block">
		{#if center}
			{@render center()}
		{:else}
			<Omnibar />
		{/if}
	</div>

	<div class="flex items-center gap-3">
		{#if right}
			{@render right()}
		{:else}
			<PrimaryNav />
		{/if}
	</div>
</div>
