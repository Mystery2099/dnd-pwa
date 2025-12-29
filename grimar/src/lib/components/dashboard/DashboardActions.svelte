<script lang="ts">
	import { Plus } from 'lucide-svelte';
</script>

<div class="px-4 py-16 text-center">
	<div
		class="card-crystal relative mx-auto inline-block max-w-md overflow-hidden p-8 backdrop-blur-xl"
	>
		<div
			class="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-linear-to-br from-white/12 to-transparent opacity-50"
		></div>
		<h2 class="text-holo mb-2 text-2xl font-bold text-white">The Forge Awaits</h2>
		<p class="mb-8 leading-relaxed text-gray-400">
			You have no characters inscribed in your Grimoire yet. Create a new hero to begin your
			journey.
		</p>
		<a
			href="/forge"
			class="btn-gem inline-flex items-center gap-2 px-6 py-3 text-base"
			onclick={(e) => {
				// Handle navigation with proper SvelteKit routing
				const target = e.currentTarget as HTMLAnchorElement;
				const url = new URL(target.href, window.location.origin);
				if (window.location.pathname !== url.pathname) {
					import('$app/navigation').then(({ goto }) => {
						goto(url.pathname).catch(() => {});
					});
				}
				e.preventDefault();
			}}
		>
			<Plus class="size-5" />
			<span>Create New Character</span>
		</a>
	</div>
</div>
