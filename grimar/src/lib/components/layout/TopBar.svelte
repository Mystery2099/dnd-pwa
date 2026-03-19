<script lang="ts">
	import { page } from '$app/state';
	import { Search } from 'lucide-svelte';
	import Select from '$lib/components/ui/select/select.svelte';
	import { setTheme, THEME_OPTIONS, themeStore } from '$lib/core/client/themeStore.svelte';

	const routeLabels: Record<string, string> = {
		dashboard: 'Dashboard',
		compendium: 'Compendium',
		characters: 'Characters',
		settings: 'Settings',
		homebrew: 'Homebrew',
		login: 'Login'
	};

	const activeThemeId = $derived($themeStore);
	const currentSection = $derived.by(() => {
		const segments = page.url.pathname.split('/').filter(Boolean);
		const [segment, childSegment] = segments;
		if (segment === 'beta' && childSegment === 'compendium') {
			return 'Compendium Beta';
		}
		return routeLabels[segment ?? 'dashboard'] ?? 'Dashboard';
	});
</script>

<header
	class="relative sticky top-0 z-40 flex min-h-12 w-full items-center justify-between gap-4 border-b border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-overlay)_52%,var(--color-bg-canvas)),color-mix(in_srgb,var(--color-bg-overlay)_24%,var(--color-bg-canvas)))] px-5 py-3 md:px-7 xl:px-9 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_10%,transparent),inset_0_-1px_0_color-mix(in_srgb,var(--color-accent)_10%,transparent),0_12px_30px_color-mix(in_srgb,black_18%,transparent),0_1px_0_color-mix(in_srgb,var(--color-text-primary)_4%,transparent)] backdrop-blur-[24px]"
>
	<div
		class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-text-primary)_6%,transparent),transparent_28%,color-mix(in_srgb,var(--color-accent)_10%,transparent)),radial-gradient(circle_at_18%_0%,color-mix(in_srgb,var(--color-accent)_22%,transparent),transparent_26%),radial-gradient(circle_at_82%_18%,color-mix(in_srgb,var(--color-text-primary)_8%,transparent),transparent_22%),linear-gradient(96deg,transparent,color-mix(in_srgb,var(--color-accent)_8%,transparent),transparent_68%)] opacity-90"
	></div>
	<div class="relative flex min-w-0 items-center gap-3">
		<span
			class="mt-px size-1.5 rotate-45 rounded-[1px] bg-[var(--color-accent)] shadow-[0_0_12px_var(--color-accent-glow)]"
			aria-hidden="true"
		></span>
		<div class="min-w-0">
			<p
				class="truncate text-[0.76rem] font-[var(--font-display)] font-semibold tracking-[0.34em] text-[var(--color-accent)] uppercase"
			>
				{currentSection}
			</p>
		</div>
	</div>

	<div class="relative flex items-center gap-3">
		<label class="group relative hidden sm:block">
			<span class="sr-only">Search the Hermetica</span>
			<Search
				class="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[var(--color-text-muted)] transition-colors group-focus-within:text-[var(--color-accent)]"
			/>
			<input
				type="search"
				placeholder="Search the Hermetica..."
				class="appearance-none h-9 w-[clamp(12rem,26vw,18rem)] rounded-lg border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_74%,transparent),color-mix(in_srgb,var(--color-bg-overlay)_22%,transparent))] pr-3 pl-9 text-sm text-[var(--color-text-secondary)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_8%,transparent),0_0_0_1px_color-mix(in_srgb,var(--color-border)_20%,transparent)] transition-[border-color,box-shadow,color,background-color] outline-none placeholder:text-[color-mix(in_srgb,var(--color-text-muted)_86%,transparent)] focus:border-[var(--color-border-hover)] focus:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_82%,transparent),color-mix(in_srgb,var(--color-accent)_10%,transparent))] focus:text-[var(--color-text-primary)] focus:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_10%,transparent),0_0_0_1px_color-mix(in_srgb,var(--color-accent)_24%,transparent),0_0_18px_color-mix(in_srgb,var(--color-accent)_10%,transparent)]"
			/>
		</label>

		<div class="flex items-center">
			<Select
				type="single"
				value={activeThemeId}
				onchange={setTheme}
				options={THEME_OPTIONS}
				placeholder="Theme"
				class="h-8 min-w-[9.5rem] rounded-md border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_60%,transparent),color-mix(in_srgb,var(--color-bg-overlay)_16%,transparent))] px-3 text-sm font-medium tracking-[0.04em] text-[var(--color-text-secondary)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_8%,transparent)] hover:border-[var(--color-border-hover)] hover:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_70%,transparent),color-mix(in_srgb,var(--color-accent)_8%,transparent))] focus:ring-1 focus:ring-[color-mix(in_srgb,var(--color-accent)_36%,transparent)] focus:ring-offset-0"
				contentClass="min-w-[10rem]"
			/>
		</div>
	</div>
</header>
