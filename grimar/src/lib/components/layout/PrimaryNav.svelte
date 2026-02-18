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
			{ href: '/homebrew', label: 'Homebrew' },
			{ href: '/settings', label: 'Settings' }
		]
	}: Props = $props();
</script>

<nav
	class="hidden items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] md:flex"
>
	{#each items as item (item.href)}
		<a
			class={'rounded-full border px-4 py-1.5 transition-all duration-200 ' +
				(item.href === page.url.pathname
					? 'border-[var(--color-accent)]/50 bg-[var(--color-accent)]/20 text-[var(--color-text-primary)] shadow-[var(--color-accent-glow)]'
					: 'border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]')}
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
