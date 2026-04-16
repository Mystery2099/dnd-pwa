<script lang="ts">
	import type { Snippet } from 'svelte';
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import TopBar from '$lib/components/layout/TopBar.svelte';
	import VerticalNav from '$lib/components/layout/VerticalNav.svelte';
	import { Sheet } from '$lib/components/ui/sheet';

	type ShellUser = {
		username: string;
		name: string;
		email: string | null;
		role: 'user' | 'admin';
	} | null;

	type Props = {
		children: Snippet;
		user?: ShellUser;
	};

	const SIDEBAR_COLLAPSED_STORAGE_KEY = 'grimar-sidebar-collapsed';

	function readStoredSidebarCollapsed(): boolean {
		if (!browser) {
			return false;
		}

		return localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === 'true';
	}

	let { children, user = null }: Props = $props();
	let sidebarCollapsed = $state(readStoredSidebarCollapsed());
	let mobileNavOpen = $state(false);
	const collapsedSidebarWidth = '64px';
	const expandedSidebarWidth = '220px';
	const shellSidebarOffset = $derived(sidebarCollapsed ? '67px' : '223px');
	const sidebarWidth = $derived(sidebarCollapsed ? collapsedSidebarWidth : expandedSidebarWidth);

	$effect(() => {
		if (!browser) {
			return;
		}

		localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(sidebarCollapsed));
	});

	afterNavigate(() => {
		mobileNavOpen = false;
	});
</script>

<div
	class="relative flex h-screen bg-[var(--color-bg-canvas)] text-[var(--color-text-primary)] selection:bg-[var(--color-accent)]/30"
>
	<div class="pointer-events-none fixed inset-0 overflow-hidden">
		<div
			class="absolute inset-0 bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--color-accent)_12%,transparent),transparent_34%),radial-gradient(circle_at_16%_10%,color-mix(in_srgb,#9c7943_14%,transparent),transparent_24%),radial-gradient(circle_at_84%_14%,color-mix(in_srgb,#71452d_12%,transparent),transparent_22%),linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-canvas)_74%,black),color-mix(in_srgb,var(--color-bg-canvas)_92%,#040302)_44%,color-mix(in_srgb,var(--color-bg-canvas)_80%,#140d08))]"
		></div>
		<div
			class="absolute inset-0 opacity-[calc(var(--noise-opacity)*1.55)]"
			style="background-image:
				linear-gradient(90deg, color-mix(in_srgb, #5e4128 0.12, transparent) 0, transparent 16%, color-mix(in_srgb, #251912 0.18, transparent) 48%, transparent 74%, color-mix(in_srgb, #5e4128 0.12, transparent) 100%),
				repeating-linear-gradient(90deg, color-mix(in_srgb, #1a120d 0.24, transparent) 0 1px, transparent 1px 28px),
				repeating-linear-gradient(0deg, color-mix(in_srgb, black 0.18, transparent) 0 2px, transparent 2px 19px),
				radial-gradient(circle at 24% 20%, color-mix(in_srgb, #8b6a34 0.18, transparent), transparent 20%),
				radial-gradient(circle at 74% 16%, color-mix(in_srgb, #7b4730 0.14, transparent), transparent 18%),
				radial-gradient(circle at 50% 100%, color-mix(in_srgb, black 0.26, transparent), transparent 38%);
			background-size: auto, auto, auto, auto, auto, auto;"
		></div>
		<div
			class="absolute inset-0 opacity-75"
			style="background-image:
				linear-gradient(180deg, transparent, color-mix(in_srgb, black 0.12, transparent) 64%, color-mix(in_srgb, black 0.22, transparent)),
				radial-gradient(circle at 50% 0%, color-mix(in_srgb, var(--color-text-primary) 0.03, transparent), transparent 42%),
				linear-gradient(102deg, transparent 0 18%, color-mix(in_srgb, #e0c88c 0.06, transparent) 28%, transparent 38%, transparent 62%, color-mix(in_srgb, #7f5d33 0.08, transparent) 72%, transparent 82%),
				linear-gradient(0deg, color-mix(in_srgb, #20140e 0.16, transparent), transparent 22%, transparent 78%, color-mix(in_srgb, #0b0806 0.22, transparent));
			background-size: auto, auto, auto, auto;"
		></div>
		<div
			class="absolute inset-0 opacity-45"
			style="background-image:
				radial-gradient(circle at 14% 78%, color-mix(in_srgb, #c29a5a 0.12, transparent), transparent 18%),
				radial-gradient(circle at 88% 72%, color-mix(in_srgb, #8f5b39 0.1, transparent), transparent 20%),
				radial-gradient(circle at 54% 38%, color-mix(in_srgb, #f3e0a5 0.04, transparent), transparent 24%);
			background-size: auto, auto, auto;"
		></div>
		<div
			class="absolute inset-y-0 left-[max(14rem,18vw)] w-px bg-[linear-gradient(180deg,transparent,color-mix(in_srgb,var(--color-border)_72%,transparent),transparent)] opacity-70"
		></div>
	</div>

	<div
		class="pointer-events-none fixed top-0 right-3 bottom-3 left-3 z-0 rounded-[1.75rem] bg-[linear-gradient(180deg,color-mix(in_srgb,black_18%,transparent),transparent_16%,transparent_78%,color-mix(in_srgb,black_24%,transparent))] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_4%,transparent),inset_0_-1px_0_color-mix(in_srgb,black_26%,transparent),0_26px_80px_color-mix(in_srgb,black_46%,transparent)]"
	></div>

	<!-- Left Rail (thin decorative bar) -->
	<div
		class="fixed top-0 bottom-0 left-0 z-60 hidden w-3 border-r border-[var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-overlay)_34%,var(--color-bg-canvas)),color-mix(in_srgb,var(--color-bg-overlay)_18%,var(--color-bg-canvas)))] shadow-[inset_-1px_0_0_color-mix(in_srgb,var(--color-text-primary)_7%,transparent),2px_0_16px_color-mix(in_srgb,black_22%,transparent)] lg:block"
	></div>

	<!-- Sidebar -->
	<aside
		class="fixed top-0 bottom-0 left-3 z-50 relative hidden flex-col before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-text-primary)_7%,transparent),transparent_22%,transparent_72%,color-mix(in_srgb,var(--color-accent)_8%,transparent)),radial-gradient(circle_at_22%_14%,color-mix(in_srgb,var(--color-accent)_18%,transparent),transparent_30%),radial-gradient(circle_at_78%_70%,color-mix(in_srgb,var(--color-text-primary)_8%,transparent),transparent_26%)] before:opacity-85 before:mix-blend-screen before:content-[''] transition-[width] duration-[360ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] lg:flex"
		style="width: {sidebarWidth};"
	>
		<VerticalNav bind:collapsed={sidebarCollapsed} {user} />
	</aside>

	<Sheet
		bind:open={mobileNavOpen}
		side="left"
		title="Navigation"
		description="Jump between the dashboard, compendium, characters, and settings."
		class="w-[min(20rem,calc(100vw-1rem))] border-r border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-overlay)_52%,var(--color-bg-canvas)),color-mix(in_srgb,var(--color-bg-overlay)_24%,var(--color-bg-canvas)))] shadow-[18px_0_42px_color-mix(in_srgb,black_22%,transparent)]"
	>
		<div class="-mx-6 -mb-6 mt-4 h-[calc(100%-1rem)]">
			<VerticalNav collapsed={false} allowCollapse={false} {user} />
		</div>
	</Sheet>

	<!-- Right Rail (thin decorative bar) -->
	<div
		class="fixed top-0 right-0 bottom-0 z-60 hidden w-3 border-l border-[var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-overlay)_34%,var(--color-bg-canvas)),color-mix(in_srgb,var(--color-bg-overlay)_18%,var(--color-bg-canvas)))] shadow-[inset_1px_0_0_color-mix(in_srgb,var(--color-text-primary)_7%,transparent),-2px_0_16px_color-mix(in_srgb,black_22%,transparent)] lg:block"
	></div>

	<!-- Bottom Rail -->
	<div
		class="fixed right-0 bottom-0 left-0 z-60 hidden h-3 border-t border-[var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-overlay)_34%,var(--color-bg-canvas)),color-mix(in_srgb,var(--color-bg-overlay)_18%,var(--color-bg-canvas)))] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_7%,transparent),0_-2px_16px_color-mix(in_srgb,black_24%,transparent)] lg:block"
	>
		<!-- Corner Connectors (Visual Only) -->
		<div
			class="absolute bottom-0 left-0 h-full w-4 border-r border-[var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-overlay)_34%,var(--color-bg-canvas)),color-mix(in_srgb,var(--color-bg-overlay)_18%,var(--color-bg-canvas)))]"
		></div>
		<div
			class="absolute right-0 bottom-0 h-full w-4 border-l border-[var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-overlay)_34%,var(--color-bg-canvas)),color-mix(in_srgb,var(--color-bg-overlay)_18%,var(--color-bg-canvas)))]"
		></div>
	</div>

	<!-- Main Content Area -->
	<main
		class="app-shell-main fixed top-0 right-0 bottom-0 z-30 overflow-y-auto border-l-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-canvas)_64%,transparent),color-mix(in_srgb,var(--color-bg-overlay)_26%,transparent))] pb-16 backdrop-blur-[28px] shadow-[-22px_0_44px_color-mix(in_srgb,black_18%,transparent),0_22px_56px_color-mix(in_srgb,black_22%,transparent)] transition-[left] duration-[360ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] lg:right-3 lg:bottom-3 lg:border-l lg:border-[color-mix(in_srgb,var(--color-border)_72%,transparent)]"
		style={`--shell-sidebar-offset:${shellSidebarOffset};`}
	>
		<div
			class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-text-primary)_6%,transparent),transparent_14%,transparent_72%,color-mix(in_srgb,var(--color-accent)_10%,transparent)),radial-gradient(circle_at_14%_8%,color-mix(in_srgb,var(--color-accent)_18%,transparent),transparent_28%),radial-gradient(circle_at_86%_18%,color-mix(in_srgb,var(--color-text-primary)_8%,transparent),transparent_22%),radial-gradient(circle_at_36%_72%,color-mix(in_srgb,var(--color-accent)_10%,transparent),transparent_24%),linear-gradient(92deg,transparent,color-mix(in_srgb,var(--color-accent)_8%,transparent),transparent_68%)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_7%,transparent),inset_0_-1px_0_color-mix(in_srgb,black_20%,transparent)]"
		></div>
		<TopBar onNavToggle={() => (mobileNavOpen = !mobileNavOpen)} />
		<div class="w-full max-w-[min(112rem,100vw)] px-4 pt-18 md:px-7 md:pt-22 xl:max-w-[min(112rem,calc(100vw-5.5rem))] xl:px-9">
			{@render children()}
		</div>
	</main>
</div>
