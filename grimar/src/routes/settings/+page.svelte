<script lang="ts">
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import ThemeSwitcher from '$lib/components/ui/ThemeSwitcher.svelte';
	import { Palette, Cog, Shield, Info } from 'lucide-svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Settings - Grimar</title>
</svelte:head>

<div class="space-y-6 animate-enter">
	<header class="flex items-center gap-3 px-2">
		<div class="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
			<Cog class="size-6" />
		</div>
		<div>
			<h1 class="text-2xl font-black tracking-tight text-white">Settings</h1>
			<p class="text-sm text-gray-400">Configure your grimoire experience</p>
		</div>
	</header>

	<div class="grid grid-cols-1 gap-6">
		<!-- Appearance Section -->
		<SurfaceCard class="p-6 space-y-6">
			<div class="flex items-center gap-3 border-b border-white/5 pb-4">
				<Palette class="size-5 text-purple-400" />
				<h2 class="text-lg font-bold text-white">Appearance</h2>
			</div>

			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-300 mb-2">Theme Selection</label>
					<p class="text-xs text-gray-500 mb-4">Choose a magical essence for your interface.</p>
					<ThemeSwitcher />
				</div>
			</div>
		</SurfaceCard>

		<!-- Other placeholders -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<SurfaceCard class="p-6 opacity-50 cursor-not-allowed">
				<div class="flex items-center gap-3 border-b border-white/5 pb-4">
					<Shield class="size-5 text-blue-400" />
					<h2 class="text-lg font-bold text-white">Security</h2>
				</div>
				<p class="mt-4 text-sm text-gray-400 italic">Advanced authentication settings coming soon.</p>
			</SurfaceCard>

			<SurfaceCard class="p-6">
				<div class="flex items-center gap-3 border-b border-white/5 pb-4">
					<Info class="size-5 text-emerald-400" />
					<h2 class="text-lg font-bold text-white">About</h2>
				</div>
				<div class="mt-4 space-y-2 text-sm text-gray-400">
					<p><span class="font-semibold text-gray-300">Grimar Hermetica</span> v0.1.0</p>
					<p>A self-hosted D&D 5e Grimoire.</p>
					<div class="pt-2">
						<a href="https://github.com" class="text-purple-400 hover:underline">Documentation</a>
					</div>
				</div>
			</SurfaceCard>
		</div>
	</div>
</div>
