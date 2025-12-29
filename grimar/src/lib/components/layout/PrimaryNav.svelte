<script lang="ts">
	import { page } from '$app/state';

	type NavItem = {
		href: string;
		label: string;
	};

	type Props = {
		items?: NavItem[];
	};

	let {
		items = [
			{ href: '/dashboard', label: 'Dashboard' },
			{ href: '/compendium', label: 'Compendium' },
			{ href: '/settings', label: 'Settings' }
		]
	}: Props = $props();
</script>

<nav class="hidden items-center gap-2 text-sm font-medium text-gray-300 md:flex">
	{#each items as item (item.href)}
		<a
			class={'rounded-full border px-4 py-1.5 transition-all duration-200 ' +
				(item.href === page.url.pathname
					? 'border-purple-400/50 bg-purple-500/20 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
					: 'border-transparent hover:border-white/20 hover:bg-white/10 hover:text-white')}
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
			}}
		>
			{item.label}
		</a>
	{/each}
</nav>
