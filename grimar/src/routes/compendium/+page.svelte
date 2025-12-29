<script lang="ts">
	import CategoryCard from '$lib/components/compendium/CategoryCard.svelte';
	import {
		Flame,
		Skull,
		Sparkles,
		Search,
		Shield,
		Users,
		Scroll,
		Medal,
		Sword,
		Shirt,
		Activity,
		Globe,
		BookOpen
	} from 'lucide-svelte';
</script>

<div class="relative flex min-h-[calc(100vh-6rem)] animate-enter flex-col items-center py-12 pb-24">
	<!-- Header -->
	<div class="mx-auto mb-12 max-w-2xl px-4 text-center">
		<h1
			class="mb-4 bg-linear-to-b from-white via-white to-purple-200 bg-clip-text text-4xl font-black tracking-tight text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.5)] md:text-5xl"
		>
			The Compendium
		</h1>
		<p class="text-lg text-gray-400">
			A complete index of arcane knowledge. Browse spells, beasts, and artifacts gathered from the
			weave.
		</p>
	</div>

	<!-- Search Hint -->
	<button class="group relative z-10 mx-auto mb-16 w-full max-w-lg">
		<div
			class="absolute -inset-0.5 rounded-full bg-linear-to-r from-purple-500 to-indigo-500 opacity-30 blur transition duration-500 group-hover:opacity-60"
		></div>
		<div
			class="relative flex h-14 w-full items-center gap-3 rounded-full border border-white/10 bg-gray-900/80 px-6 text-left shadow-2xl backdrop-blur-xl transition-all group-hover:bg-gray-900/90"
		>
			<Search class="size-5 text-gray-400 transition-colors group-hover:text-purple-400" />
			<span class="text-lg text-gray-400">Search the archives...</span>
			<div class="ml-auto flex gap-1">
				<kbd
					class="hidden items-center gap-1 rounded border border-white/10 bg-white/10 px-2 py-1 text-xs font-bold text-gray-500 md:inline-flex"
					>⌘ K</kbd
				>
			</div>
		</div>
	</button>

	<div class="flex w-full max-w-6xl flex-col gap-16 px-4">
		<!-- Section 1: Primary Archives -->
		<section>
			<h2 class="mb-6 inline-block border-b border-white/10 pb-2 text-xl font-bold text-white">
				Primary Archives
			</h2>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
				<CategoryCard
					title="Spells"
					description="Incantations and rituals."
					href="/compendium/spells"
					icon={Flame}
					gradient="from-rose-500/20 to-orange-500/20"
					accent="text-rose-400"
				/>

				<CategoryCard
					title="Monsters"
					description="Beasts and planar entities."
					href="/compendium/monsters"
					icon={Skull}
					gradient="from-emerald-500/20 to-teal-500/20"
					accent="text-emerald-400"
				/>

				<CategoryCard
					title="Magic Items"
					description="Artifacts and wonders."
					href="/compendium/magicitems"
					icon={Sparkles}
					gradient="from-sky-500/20 to-indigo-500/20"
					accent="text-sky-400"
				/>
			</div>
		</section>

		<!-- Section 2: Character Options -->
		<section>
			<h2 class="mb-6 inline-block border-b border-white/10 pb-2 text-xl font-bold text-white">
				Character Options
			</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<CategoryCard
					title="Classes"
					description="Paths of power."
					href="/compendium/classes"
					icon={Shield}
					gradient="from-amber-500/20 to-orange-500/20"
					accent="text-amber-400"
				/>
				<CategoryCard
					title="Races"
					description="Lineages and origins."
					href="/compendium/races"
					icon={Users}
					gradient="from-pink-500/20 to-rose-500/20"
					accent="text-pink-400"
				/>
				<CategoryCard
					title="Backgrounds"
					description="History and lore."
					href="/compendium/backgrounds"
					icon={Scroll}
					gradient="from-indigo-500/20 to-violet-500/20"
					accent="text-indigo-400"
				/>
				<CategoryCard
					title="Feats"
					description="Specialized talents."
					href="/compendium/feats"
					icon={Medal}
					gradient="from-yellow-500/20 to-amber-500/20"
					accent="text-yellow-400"
				/>
			</div>
		</section>

		<!-- Section 3: The Armory -->
		<section>
			<h2 class="mb-6 inline-block border-b border-white/10 pb-2 text-xl font-bold text-white">
				The Armory
			</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<CategoryCard
					title="Weapons"
					description="Blades, bows, and axes."
					href="/compendium/weapons"
					icon={Sword}
					gradient="from-slate-500/20 to-gray-500/20"
					accent="text-slate-400"
				/>
				<CategoryCard
					title="Armor"
					description="Protection and shields."
					href="/compendium/armor"
					icon={Shirt}
					gradient="from-zinc-500/20 to-slate-500/20"
					accent="text-zinc-400"
				/>
			</div>
		</section>

		<!-- Section 4: Rules & Reference -->
		<section>
			<h2 class="mb-6 inline-block border-b border-white/10 pb-2 text-xl font-bold text-white">
				Rules & Reference
			</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<CategoryCard
					title="Conditions"
					description="Afflictions and states."
					href="/compendium/conditions"
					icon={Activity}
					gradient="from-red-500/20 to-rose-500/20"
					accent="text-red-400"
				/>
				<CategoryCard
					title="Planes"
					description="The multiverse."
					href="/compendium/planes"
					icon={Globe}
					gradient="from-blue-500/20 to-cyan-500/20"
					accent="text-blue-400"
				/>
				<CategoryCard
					title="Rules"
					description="SRD Reference."
					href="/compendium/sections"
					icon={BookOpen}
					gradient="from-purple-500/20 to-fuchsia-500/20"
					accent="text-purple-400"
				/>
			</div>
		</section>
	</div>
</div>
