<script lang="ts">
	import { page } from '$app/state';
	import logoUrl from '$lib/assets/grimar-hermetica-title.png';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	type NavItem = {
		href: string;
		label: string;
		disabled?: boolean;
	};

	type NavSection = {
		label: string;
		items: NavItem[];
	};

	type Props = {
		sections?: NavSection[];
		collapsed?: boolean;
	};

	let {
		sections = [
			{
				label: 'Grimoire',
				items: [
					{ href: '/dashboard', label: 'Dashboard' },
					{ href: '/compendium', label: 'Compendium' },
					{ href: '/characters', label: 'Characters' },
					{ href: '/forge', label: 'The Forge', disabled: true }
				]
			},
			{
				label: 'System',
				items: [{ href: '/settings', label: 'Settings', disabled: true }]
			}
		],
		collapsed = $bindable(false)
	}: Props = $props();

	function isActive(href: string) {
		return page.url.pathname === href || page.url.pathname.startsWith(href + '/');
	}

	function toggleCollapsed() {
		collapsed = !collapsed;
	}

	function getLinkClass(href: string) {
		const active = isActive(href);
		const base = 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200';
		if (active) {
			return `${base} bg-[var(--color-accent)]/20 text-[var(--color-text-primary)] shadow-[var(--color-accent-glow)]`;
		}
		return `${base} text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]`;
	}
</script>

<nav
	class="flex h-full flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-primary)]"
	style="width: {collapsed ? '64px' : '220px'}"
>
	<!-- Logo Section -->
	<div
		class="flex items-center gap-3 border-b border-[var(--color-border)] px-3 py-4 {collapsed
			? 'justify-center'
			: ''}"
	>
		{#if !collapsed}
			<a
				href="/dashboard"
				class="block transition duration-300 hover:drop-shadow-[0_0_15px_var(--color-accent-glow)]"
			>
				<img src={logoUrl} alt="Grimar" class="h-10 w-auto" />
			</a>
		{:else}
			<a
				href="/dashboard"
				class="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-bg-card)] text-lg font-bold text-[var(--color-text-primary)] transition hover:bg-[var(--color-accent)]/20"
			>
				G
			</a>
		{/if}
	</div>

	<!-- Navigation Sections -->
	<div class="flex-1 overflow-y-auto p-2">
		{#each sections as section}
			<div class="mb-4 flex flex-col gap-1">
				{#if !collapsed}
					<div
						class="px-3 py-2 text-xs font-bold tracking-widest text-[var(--color-text-muted)] uppercase"
					>
						{section.label}
					</div>
				{/if}				{#each section.items as item (item.href)}
					{#if item.disabled}
						<span
							class="pointer-events-none flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium opacity-50 {collapsed
								? 'justify-center'
								: ''}"
						>
							{#if collapsed}
								<span
									class="flex h-5 w-5 items-center justify-center rounded bg-[var(--color-text-muted)]/30 text-xs"
								>
									{item.label[0]}
								</span>
							{:else}
								{item.label}
							{/if}
						</span>
					{:else}
						<a class={getLinkClass(item.href)} href={item.href}>
							{#if collapsed}
								<span
									class="flex h-5 w-5 items-center justify-center rounded bg-[var(--color-bg-card)] text-xs {isActive(
										item.href
									)
										? 'bg-[var(--color-accent)]/30 text-[var(--color-text-primary)]'
										: ''}"
								>
									{item.label[0]}
								</span>
							{:else}
								{item.label}
							{/if}
						</a>{/if}
				{/each}
			</div>
		{/each}
	</div><!-- Collapse Toggle -->
	<div class="border-t border-[var(--color-border)] p-2">
		<button
			type="button"
			class="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]"
			onclick={toggleCollapsed}
		>
			{#if collapsed}
				<ChevronRight class="size-4" />
			{:else}
				<ChevronLeft class="size-4" />
				<span>Collapse</span>
			{/if}		</button>
	</div>
</nav>