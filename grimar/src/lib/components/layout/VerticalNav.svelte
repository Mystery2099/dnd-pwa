<script lang="ts">
	import { page } from '$app/state';
	import logoUrl from '$lib/assets/grimar-hermetica-title.png';
	import NavItemIcon from '$lib/components/layout/NavItemIcon.svelte';
	import NavToggleIcon from '$lib/components/layout/NavToggleIcon.svelte';

	type NavItem = {
		href: string;
		label: string;
		icon: 'dashboard' | 'compendium' | 'homebrew' | 'characters' | 'forge';
		disabled?: boolean;
	};

	type NavSection = {
		label: string;
		items: NavItem[];
	};

	type Props = {
		sections?: NavSection[];
		collapsed?: boolean;
		user?: {
			username: string;
			name: string;
			email: string | null;
			role: 'user' | 'admin';
		} | null;
	};

	let {
		sections = [
			{
				label: 'Overview',
				items: [{ href: '/dashboard', label: 'Dashboard', icon: 'dashboard' }]
			},
			{
				label: 'Knowledge',
				items: [
					{ href: '/compendium', label: 'Compendium', icon: 'compendium' },
					{ href: '/homebrew', label: 'Homebrew', icon: 'homebrew' }
				]
			},
			{
				label: 'Characters',
				items: [
					{ href: '/characters', label: 'Characters', icon: 'characters' },
					{ href: '/forge', label: 'The Forge', icon: 'forge', disabled: true }
				]
			}
		],
		user = null,
		collapsed = $bindable(false)
	}: Props = $props();

	const accountLabel = $derived(user?.name?.trim() || user?.username || 'Traveler');
	const accountInitials = $derived(
		accountLabel
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? '')
			.join('') || 'G'
	);
	const accountDisplayName = $derived(user?.username || accountLabel);
	const accountRole = $derived(user?.role === 'admin' ? 'Grand Archivist' : 'Arcane Scholar');

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
		return `${base} text-[var(--color-text-muted)] hover:bg-[color-mix(in_srgb,var(--color-bg-card)_60%,transparent)] hover:text-[var(--color-text-primary)]`;
	}
</script>

<nav
	class="flex h-full flex-col overflow-hidden border-r border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg-overlay)_24%,var(--color-bg-canvas))] shadow-[inset_-1px_0_0_color-mix(in_srgb,var(--color-text-primary)_5%,transparent)] backdrop-blur-md transition-[width,background-color] duration-300 ease-[var(--ease-smooth)]"
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
				class="flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-bg-card)_58%,transparent)] text-lg font-bold text-[var(--color-text-primary)] transition hover:bg-[var(--color-accent)]/20"
			>
				G
			</a>
		{/if}
	</div>

	<!-- Navigation Sections -->
	<div class="flex-1 overflow-y-auto p-2 transition-[padding] duration-300 ease-[var(--ease-smooth)]">
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
							class="pointer-events-none flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium opacity-50 transition-[padding,gap] duration-300 ease-[var(--ease-smooth)] {collapsed
								? 'justify-center'
								: ''}"
						>
							{#if collapsed}
								<span
									class="flex size-6 items-center justify-center rounded-lg bg-[var(--color-text-muted)]/16 text-[var(--color-text-muted)]"
								>
									<NavItemIcon icon={item.icon} class="size-3.5" />
								</span>
							{:else}
								<NavItemIcon icon={item.icon} class="size-4 shrink-0" />
								<span>{item.label}</span>
							{/if}
						</span>
					{:else}
						<a class={`${getLinkClass(item.href)} transition-[padding,gap] duration-300 ease-[var(--ease-smooth)]`} href={item.href}>
							{#if collapsed}
								<span
									class="flex size-6 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-bg-card)_58%,transparent)] {isActive(
										item.href
									)
										? 'bg-[var(--color-accent)]/18 text-[var(--color-text-primary)]'
										: ''}"
								>
									<NavItemIcon icon={item.icon} class="size-3.5" />
								</span>
							{:else}
								<NavItemIcon icon={item.icon} class="size-4 shrink-0" />
								<span>{item.label}</span>
							{/if}
						</a>{/if}
				{/each}
			</div>
		{/each}
	</div>

	<div class="mt-auto border-t border-[var(--color-border)] px-2 pt-2 pb-5 transition-[padding] duration-300 ease-[var(--ease-smooth)]">
		<button
			type="button"
			class="mb-2 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-text-muted)] transition-[padding,gap,color,background-color] duration-300 ease-[var(--ease-smooth)] hover:bg-[color-mix(in_srgb,var(--color-bg-card)_60%,transparent)] hover:text-[var(--color-text-primary)]"
			onclick={toggleCollapsed}
		>
			<NavToggleIcon {collapsed} class="size-5 shrink-0" />
			{#if !collapsed}
				<span>Collapse</span>
			{/if}
		</button>

		{#if user}
			<a
				href="/settings"
				class="group flex items-center gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-border)_76%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_52%,transparent),color-mix(in_srgb,var(--color-bg-overlay)_18%,transparent))] px-3 py-3 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_10%,transparent)] transition-[border-color,background-color,transform,padding,gap] duration-300 ease-[var(--ease-smooth)] hover:border-[var(--color-border-hover)] hover:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_62%,transparent),color-mix(in_srgb,var(--color-bg-overlay)_24%,transparent))] {collapsed
					? 'justify-center'
					: ''}"
			>
				<div
					class="flex size-9 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,color-mix(in_srgb,var(--color-text-primary)_16%,transparent),color-mix(in_srgb,var(--color-accent)_68%,transparent))] text-[0.8rem] font-semibold tracking-[0.04em] text-[var(--color-text-primary)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_24%,transparent),0_0_14px_color-mix(in_srgb,var(--color-accent)_16%,transparent)]"
				>
					{accountInitials}
				</div>

				{#if !collapsed}
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-semibold text-[var(--color-text-primary)]">
							{accountDisplayName}
						</p>
						<div
							class="mt-0.5 flex items-center gap-2 text-[0.62rem] font-semibold tracking-[0.22em] text-[var(--color-accent)] uppercase"
						>
							<span>{accountRole}</span>
							<span
								class="size-1 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent-glow)]"
								aria-hidden="true"
							></span>
						</div>
					</div>
				{/if}
			</a>
		{/if}
	</div>
</nav>
