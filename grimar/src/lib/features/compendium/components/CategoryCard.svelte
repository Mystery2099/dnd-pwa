<script lang="ts">
	import type { ComponentType } from 'svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';

	interface Props {
		title: string;
		description: string;
		href: string;
		icon: ComponentType;
		gradient: string; // e.g. "from-rose-500/20 to-purple-500/20"
		accent: string; // e.g. "text-rose-400"
	}

	let { title, description, href, icon: Icon, gradient, accent }: Props = $props();
</script>

<SurfaceCard
	{href}
	class="group h-full border border-[var(--color-border)] hover:scale-[1.02] hover:border-[var(--color-accent)]/30 hover:shadow-[var(--color-accent-glow)]"
>
	<!-- Static Glossy Overlay -->
	<div
		class="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-linear-to-br from-[color-mix(in_srgb,var(--color-text-primary)_15%,transparent)] to-transparent opacity-60 transition-opacity group-hover:opacity-80"
	></div>

	<!-- Background Gradient -->
	<div
		class="absolute inset-0 {gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100"
	></div>

	<div class="relative flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
		<!-- Icon with Glow -->
		<div
			class={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_10%,transparent),0_4px_20px_color-mix(in_srgb,black_30%,transparent)] transition-transform duration-300 group-hover:scale-110 ${accent}`}
		>
			<Icon class="size-10 drop-shadow-[0_0_8px_currentColor]" />
		</div>

		<div>
			<h3
				class="text-holo mb-2 text-2xl font-bold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-text-primary)]"
			>
				{title}
			</h3>
			<p
				class="mx-auto max-w-60 text-sm leading-relaxed text-[var(--color-text-secondary)] transition-colors group-hover:text-[var(--color-text-primary)]"
			>
				{description}
			</p>
		</div>
	</div>
</SurfaceCard>
