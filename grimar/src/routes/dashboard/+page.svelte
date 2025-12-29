<script lang="ts">
	let { data } = $props();
</script>

<div class="card-crystal relative animate-enter overflow-hidden p-6">
	<!-- Static Glossy Overlay -->
	<div
		class="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-linear-to-br from-white/15 to-transparent opacity-60"
	></div>

	<div class="relative z-10">
		<h1 class="text-holo mb-2 text-3xl font-bold text-white">Dashboard</h1>
		<p class="text-gray-300">
			Welcome to your Grimoire, <span class="font-semibold text-purple-300"
				>{data.user?.username || 'Traveler'}</span
			>.
		</p>

		<div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			<!-- Example Action Card -->
			<div
				class="group card-crystal relative p-5 transition-all duration-300 hover:scale-[1.02] hover:border-purple-400/30"
			>
				<h3 class="mb-1 text-lg font-bold text-white">Character Builder</h3>
				<p class="mb-4 text-sm text-gray-400">Create a new hero for your next adventure.</p>
				<button class="btn-gem w-full text-sm"> Open Forge </button>
			</div>

			<!-- Example Stat Panel -->
			<div class="panel-inset flex flex-col items-center justify-center p-5 text-center">
				<div class="mb-1 text-xs font-bold tracking-widest text-gray-500 uppercase">
					Active Session
				</div>
				<div class="text-sm text-gray-400">No active game session found.</div>
			</div>
		</div>
	</div>
</div>
