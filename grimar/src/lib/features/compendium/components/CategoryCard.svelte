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
	class="group h-full border border-white/10 hover:scale-[1.02] hover:border-white/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.25)]"
>
	<!-- Static Glossy Overlay -->
	<div
		class="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-linear-to-br from-white/15 to-transparent opacity-60 transition-opacity group-hover:opacity-80"
	></div>

	<!-- Background Gradient -->
	<div
		class="absolute inset-0 {gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100"
	></div>

	<div class="relative flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
		<!-- Icon with Glow -->
		<div
			class={`rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_20px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:scale-110 ${accent}`}
		>
			<Icon class="size-10 drop-shadow-[0_0_8px_currentColor]" />
		</div>

		<div>
			<h3
				class="text-holo mb-2 text-2xl font-bold text-white transition-colors group-hover:text-white"
			>
				{title}
			</h3>
			<p
				class="mx-auto max-w-60 text-sm leading-relaxed text-gray-400 transition-colors group-hover:text-gray-200"
			>
				{description}
			</p>
		</div>
	</div>
</SurfaceCard>
