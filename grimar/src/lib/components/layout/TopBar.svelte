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
		const [segment] = page.url.pathname.split('/').filter(Boolean);
		return routeLabels[segment ?? 'dashboard'] ?? 'Dashboard';
	});
</script>

<header
	class="sticky top-0 z-40 flex min-h-12 w-full items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg-overlay)_24%,var(--color-bg-canvas))] px-4 py-3 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_7%,transparent)] backdrop-blur-md"
>
	<div class="flex min-w-0 items-center gap-3">
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

	<div class="flex items-center gap-3">
		<label class="group relative hidden sm:block">
			<span class="sr-only">Search the Hermetica</span>
			<Search
				class="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[var(--color-text-muted)] transition-colors group-focus-within:text-[var(--color-accent)]"
			/>
			<input
				type="search"
				placeholder="Search the Hermetica..."
				class="h-9 w-[clamp(12rem,26vw,18rem)] rounded-lg border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg-card)_58%,transparent)] pr-3 pl-9 text-sm text-[var(--color-text-secondary)] transition-[border-color,box-shadow,color,background-color] outline-none placeholder:text-[var(--color-text-muted)]/80 focus:border-[var(--color-border-hover)] focus:bg-[color-mix(in_srgb,var(--color-bg-card)_72%,transparent)] focus:text-[var(--color-text-primary)] focus:shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-accent)_24%,transparent)]"
			/>
		</label>

		<div class="flex items-center">
			<Select
				type="single"
				value={activeThemeId}
				onchange={setTheme}
				options={THEME_OPTIONS}
				placeholder="Theme"
				class="h-8 min-w-[9.5rem] rounded-md border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_44%,transparent)] px-3 text-sm font-medium tracking-[0.04em] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] hover:bg-[color-mix(in_srgb,var(--color-bg-card)_56%,transparent)] focus:ring-1 focus:ring-[color-mix(in_srgb,var(--color-accent)_36%,transparent)] focus:ring-offset-0"
				contentClass="min-w-[10rem]"
			/>
		</div>
	</div>
</header>
