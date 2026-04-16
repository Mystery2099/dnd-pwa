<script lang="ts">
	import { page } from '$app/state';
	import logoUrl from '$lib/assets/grimar-hermetica-title.png';
	import logoIconUrl from '$lib/assets/grimar-hermetica-icon.png';
	import NavItemIcon from '$lib/components/layout/NavItemIcon.svelte';
	import NavToggleIcon from '$lib/components/layout/NavToggleIcon.svelte';
	import { Tooltip } from '$lib/components/ui/tooltip';

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
		allowCollapse?: boolean;
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
					{ href: '/beta/compendium', label: 'Compendium Beta', icon: 'compendium' },
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
		allowCollapse = true,
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
		const base =
			'ui-press group flex transform-gpu items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-[background-color,color,box-shadow,padding,gap] duration-[var(--duration-fast)] ease-[var(--ease-smooth)] motion-reduce:transform-none';
		if (active) {
			return `${base} bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-accent)_24%,transparent),color-mix(in_srgb,var(--color-accent)_12%,transparent))] text-[var(--color-text-primary)] shadow-[0_0_20px_color-mix(in_srgb,var(--color-accent)_16%,transparent),inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_8%,transparent)]`;
		}
		return `${base} text-[var(--color-text-muted)] hover:-translate-y-px hover:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_72%,transparent),color-mix(in_srgb,var(--color-accent)_8%,transparent))] hover:text-[var(--color-text-primary)] hover:shadow-[0_0.8rem_1.6rem_color-mix(in_srgb,var(--color-shadow)_10%,transparent)]`;
	}

	const collapsedTooltipClass =
		'rounded-[0.9rem] border-[color-mix(in_srgb,var(--color-border)_78%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_88%,transparent),color-mix(in_srgb,var(--color-bg-overlay)_42%,transparent))] px-3 py-2 text-[0.72rem] font-semibold tracking-[0.18em] text-[var(--color-text-primary)] uppercase shadow-[0_1rem_2rem_color-mix(in_srgb,var(--color-shadow)_22%,transparent)] backdrop-blur-xl';
</script>

<nav
	class="relative flex h-full flex-col overflow-hidden border-r border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-overlay)_52%,var(--color-bg-canvas)),color-mix(in_srgb,var(--color-bg-overlay)_24%,var(--color-bg-canvas)))] shadow-[inset_-1px_0_0_color-mix(in_srgb,var(--color-text-primary)_7%,transparent),18px_0_42px_color-mix(in_srgb,black_22%,transparent),0_18px_46px_color-mix(in_srgb,black_20%,transparent)] backdrop-blur-[24px] transition-[width,background-color] duration-[360ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
	style="width: {collapsed ? '64px' : '220px'}"
>
	<div
		class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-text-primary)_6%,transparent),transparent_16%,transparent_74%,color-mix(in_srgb,var(--color-accent)_10%,transparent)),radial-gradient(circle_at_18%_12%,color-mix(in_srgb,var(--color-accent)_22%,transparent),transparent_28%),radial-gradient(circle_at_82%_76%,color-mix(in_srgb,var(--color-text-primary)_9%,transparent),transparent_24%),radial-gradient(circle_at_34%_46%,color-mix(in_srgb,var(--color-accent)_10%,transparent),transparent_22%)] opacity-95"
	></div>
	<!-- Logo Section -->
	<div
		class="flex items-center gap-3 border-b border-[var(--color-border)] px-3 py-4 {collapsed
			? 'justify-center'
			: ''}"
	>
		{#if !collapsed}
				<a
					href="/dashboard"
				class="ui-lift ui-press block transform-gpu transition-[filter] duration-[var(--duration-base)] ease-[var(--ease-smooth)] hover:drop-shadow-[0_0_15px_var(--color-accent-glow)]"
			>
				<img src={logoUrl} alt="Grimar" class="h-10 w-auto" />
			</a>
		{:else}
				<a
					href="/dashboard"
				class="ui-lift ui-press flex h-11 w-11 transform-gpu items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--color-border)_65%,transparent)] bg-[radial-gradient(circle_at_50%_45%,color-mix(in_srgb,var(--color-bg-card)_78%,transparent),color-mix(in_srgb,var(--color-bg-overlay)_22%,transparent))] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_8%,transparent)] transition-[border-color,background-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-smooth)] hover:border-[var(--color-border-hover)] hover:bg-[radial-gradient(circle_at_50%_45%,color-mix(in_srgb,var(--color-accent)_14%,var(--color-bg-card)),color-mix(in_srgb,var(--color-bg-overlay)_28%,transparent))] hover:shadow-[0_0_16px_color-mix(in_srgb,#cfb53b_18%,transparent)]"
			>
				<img src={logoIconUrl} alt="Grimar" class="h-8 w-8 object-contain" />
			</a>
		{/if}
	</div>

	<!-- Navigation Sections -->
	<div class="relative flex-1 overflow-y-auto p-2 transition-[padding] duration-[360ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]">
		{#each sections as section (section.label)}
			<div class="mb-4 flex flex-col gap-1">
				{#if !collapsed}
					<div
						class="px-3 py-2 text-xs font-bold tracking-widest text-[var(--color-text-muted)] uppercase"
					>
						{section.label}
					</div>
				{/if}				{#each section.items as item (item.href)}
					{#if item.disabled}
						{#if collapsed}
							<Tooltip class={collapsedTooltipClass}>
								{#snippet content()}
									{item.label}
								{/snippet}
								{#snippet child({ props })}
									<span
										{...props}
										class="pointer-events-none flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium opacity-50 transition-[padding,gap] duration-[360ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] justify-center"
									>
										<span
											class="flex size-6 items-center justify-center rounded-lg bg-[var(--color-text-muted)]/16 text-[var(--color-text-muted)]"
										>
											<NavItemIcon icon={item.icon} class="size-3.5" />
										</span>
									</span>
								{/snippet}
							</Tooltip>
						{:else}
							<span
								class="pointer-events-none flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium opacity-50 transition-[padding,gap] duration-[360ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
							>
								<NavItemIcon icon={item.icon} class="size-4 shrink-0" />
								<span>{item.label}</span>
							</span>
						{/if}
					{:else}
						{#if collapsed}
							<Tooltip class={collapsedTooltipClass}>
								{#snippet content()}
									{item.label}
								{/snippet}
								{#snippet child({ props })}
									<a
										{...props}
										class={`${getLinkClass(item.href)} transition-[padding,gap] duration-[360ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]`}
											href={item.href}
									>
										<span
											class="flex size-6 items-center justify-center rounded-lg bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_70%,transparent),color-mix(in_srgb,var(--color-bg-overlay)_16%,transparent))] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_8%,transparent)] transition-[transform,background-color,color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-smooth)] group-hover:scale-[1.06] {isActive(
												item.href
											)
												? 'bg-[var(--color-accent)]/18 text-[var(--color-text-primary)]'
												: ''}"
										>
											<NavItemIcon icon={item.icon} class="size-3.5" />
										</span>
									</a>
								{/snippet}
							</Tooltip>
						{:else}
								<a
									class={`${getLinkClass(item.href)} transition-[padding,gap] duration-[360ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]`}
									href={item.href}
								>
								<NavItemIcon icon={item.icon} class="size-4 shrink-0" />
								<span>{item.label}</span>
							</a>
						{/if}
					{/if}
				{/each}
			</div>
		{/each}
	</div>

	<div class="relative mt-auto border-t border-[var(--color-border)] px-2 pt-2 pb-5 transition-[padding] duration-[360ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]">
		{#if allowCollapse}
			{#if collapsed}
				<Tooltip class={collapsedTooltipClass}>
					{#snippet content()}
						Expand navigation
					{/snippet}
					{#snippet child({ props })}
						<button
							{...props}
							type="button"
							class="ui-lift ui-press mb-2 flex w-full transform-gpu items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-text-muted)] transition-[padding,gap,color,background-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-smooth)] hover:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_72%,transparent),color-mix(in_srgb,var(--color-accent)_8%,transparent))] hover:text-[var(--color-text-primary)] hover:shadow-[0_0.75rem_1.5rem_color-mix(in_srgb,var(--color-shadow)_10%,transparent)]"
							onclick={toggleCollapsed}
						>
							<NavToggleIcon {collapsed} class="size-5 shrink-0" />
						</button>
					{/snippet}
				</Tooltip>
			{:else}
				<button
					type="button"
					class="ui-lift ui-press mb-2 flex w-full transform-gpu items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-text-muted)] transition-[padding,gap,color,background-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-smooth)] hover:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_72%,transparent),color-mix(in_srgb,var(--color-accent)_8%,transparent))] hover:text-[var(--color-text-primary)] hover:shadow-[0_0.75rem_1.5rem_color-mix(in_srgb,var(--color-shadow)_10%,transparent)]"
					onclick={toggleCollapsed}
				>
					<NavToggleIcon {collapsed} class="size-5 shrink-0" />
					<span>Collapse</span>
				</button>
			{/if}
		{/if}

		{#if user}
			{#if collapsed}
				<Tooltip class={collapsedTooltipClass}>
					{#snippet content()}
						Settings
					{/snippet}
					{#snippet child({ props })}
						<a
							{...props}
								href="/settings"
							class="ui-card-interactive group flex h-16 w-full transform-gpu items-center gap-3 overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--color-border)_76%,transparent)] bg-[radial-gradient(circle_at_16%_18%,color-mix(in_srgb,var(--color-accent)_14%,transparent),transparent_24%),linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_62%,transparent),color-mix(in_srgb,var(--color-bg-overlay)_20%,transparent))] px-3 py-3 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_10%,transparent),0_0_22px_color-mix(in_srgb,var(--color-accent)_8%,transparent)] transition-[border-color,background-color,padding,gap,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-smooth)] hover:border-[var(--color-border-hover)] hover:bg-[radial-gradient(circle_at_16%_18%,color-mix(in_srgb,var(--color-accent)_18%,transparent),transparent_28%),linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_72%,transparent),color-mix(in_srgb,var(--color-accent)_10%,transparent))] hover:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_10%,transparent),0_1rem_2rem_color-mix(in_srgb,var(--color-shadow)_12%,transparent),0_0_24px_color-mix(in_srgb,var(--color-accent)_10%,transparent)] justify-center gap-0"
						>
							<div
								class="flex size-9 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,color-mix(in_srgb,var(--color-text-primary)_16%,transparent),color-mix(in_srgb,var(--color-accent)_68%,transparent))] text-[0.8rem] font-semibold tracking-[0.04em] text-[var(--color-text-primary)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_24%,transparent),0_0_14px_color-mix(in_srgb,var(--color-accent)_16%,transparent)]"
							>
								{accountInitials}
							</div>
						</a>
					{/snippet}
				</Tooltip>
			{:else}
					<a
						href="/settings"
					class="ui-card-interactive group flex h-16 w-full transform-gpu items-center gap-3 overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--color-border)_76%,transparent)] bg-[radial-gradient(circle_at_16%_18%,color-mix(in_srgb,var(--color-accent)_14%,transparent),transparent_24%),linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_62%,transparent),color-mix(in_srgb,var(--color-bg-overlay)_20%,transparent))] px-3 py-3 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_10%,transparent),0_0_22px_color-mix(in_srgb,var(--color-accent)_8%,transparent)] transition-[border-color,background-color,padding,gap,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-smooth)] hover:border-[var(--color-border-hover)] hover:bg-[radial-gradient(circle_at_16%_18%,color-mix(in_srgb,var(--color-accent)_18%,transparent),transparent_28%),linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_72%,transparent),color-mix(in_srgb,var(--color-accent)_10%,transparent))] hover:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_10%,transparent),0_1rem_2rem_color-mix(in_srgb,var(--color-shadow)_12%,transparent),0_0_24px_color-mix(in_srgb,var(--color-accent)_10%,transparent)]"
				>
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,color-mix(in_srgb,var(--color-text-primary)_16%,transparent),color-mix(in_srgb,var(--color-accent)_68%,transparent))] text-[0.8rem] font-semibold tracking-[0.04em] text-[var(--color-text-primary)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_24%,transparent),0_0_14px_color-mix(in_srgb,var(--color-accent)_16%,transparent)]"
					>
						{accountInitials}
					</div>

					<div
						class="min-w-0 overflow-hidden transition-[max-width,opacity,margin] duration-[360ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ml-0.5 max-w-[9rem] flex-1 opacity-100"
					>
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
				</a>
			{/if}
		{/if}
	</div>
</nav>
