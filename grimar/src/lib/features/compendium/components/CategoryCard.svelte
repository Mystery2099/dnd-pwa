<script lang="ts">
	import type { ComponentType } from 'svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import Book from 'lucide-svelte/icons/book';
	import Star from 'lucide-svelte/icons/star';
	import Crown from 'lucide-svelte/icons/crown';
	import Sword from 'lucide-svelte/icons/sword';
	import Shield from 'lucide-svelte/icons/shield';
	import FlaskConical from 'lucide-svelte/icons/flask-conical';
	import Skull from 'lucide-svelte/icons/skull';
	import Heart from 'lucide-svelte/icons/heart';
	import Users from 'lucide-svelte/icons/users';
	import Compass from 'lucide-svelte/icons/compass';
	import Sparkles from 'lucide-svelte/icons/sparkles';
	import Scroll from 'lucide-svelte/icons/scroll';
	import Zap from 'lucide-svelte/icons/zap';
	import Package from 'lucide-svelte/icons/package';
	import FileText from 'lucide-svelte/icons/file-text';
	import Layers from 'lucide-svelte/icons/layers';
	import Flag from 'lucide-svelte/icons/flag';

	const iconMap: Record<string, ComponentType> = {
		book: Book,
		star: Star,
		crown: Crown,
		sword: Sword,
		shield: Shield,
		flask: FlaskConical,
		skull: Skull,
		heart: Heart,
		users: Users,
		compass: Compass,
		sparkles: Sparkles,
		scroll: Scroll,
		zap: Zap,
		package: Package,
		'file-text': FileText,
		layers: Layers,
		flag: Flag
	};

	interface Props {
		title: string;
		description: string;
		href: string;
		icon: string;
		gradient: string;
		accent: string;
		count?: number;
	}

	let { title, description, href, icon, gradient, accent, count }: Props = $props();
	const Icon = $derived(iconMap[icon] || Book);
</script>

<SurfaceCard
	{href}
	class="group relative h-full border border-[var(--color-border)] hover:scale-[1.02] hover:border-[var(--color-accent)]/30 hover:shadow-[var(--color-accent-glow)]"
>
	<!-- Static Glossy Overlay -->
	<div
		class="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-linear-to-br from-[color-mix(in_srgb,var(--color-text-primary)_15%,transparent)] to-transparent opacity-60 transition-opacity group-hover:opacity-80"
	></div>

	<!-- Background Gradient -->
	<div
		class="absolute inset-0 {gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100"
	></div>

	<div class="relative flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
		<!-- Icon with Glow -->
		<div
			class={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_10%,transparent),0_4px_20px_color-mix(in_srgb,black_30%,transparent)] transition-transform duration-300 group-hover:scale-110 ${accent}`}
		>
			<Icon class="size-8 drop-shadow-[0_0_8px_currentColor]" />
		</div>

		<div class="flex flex-col items-center gap-1">
			<h3
				class="text-holo text-xl font-bold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-text-primary)]"
			>
				{title}
			</h3>
			<p
				class="mx-auto max-w-60 text-sm leading-relaxed text-[var(--color-text-secondary)] transition-colors group-hover:text-[var(--color-text-primary)]"
			>
				{description}
			</p>
		</div>

		{#if count !== undefined}
			<div
				class="absolute right-3 top-3 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-text-muted)] shadow-sm"
			>
				{count.toLocaleString()}
			</div>
		{/if}
	</div>
</SurfaceCard>
