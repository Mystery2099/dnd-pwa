<script lang="ts">
	import { Lock, LogIn } from 'lucide-svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Sign In | Grimar</title>
</svelte:head>

<div class="flex min-h-[60vh] items-center justify-center p-4">
	<SurfaceCard padding="p-8" class="max-w-md text-center">
		<!-- Icon -->
		<div
			class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-bg-overlay)]"
		>
			<Lock class="h-8 w-8 text-[var(--color-accent)]" />
		</div>

		<!-- Title -->
		<h1 class="text-holo mb-2 text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
			Sign In to Grimar
		</h1>

		<!-- Description -->
		<p class="mb-6 text-[var(--color-text-muted)]">
			Sign in to access the Grimar compendium and character tools.
		</p>

		<!-- Actions -->
		<div class="flex flex-col gap-3">
			<Button href="/auth/login" variant="primary" size="lg">
				<LogIn class="size-5" />
				Sign In with Authentik
			</Button>
			<p class="text-xs text-[var(--color-text-muted)]">Provider: {data.authentikUrl}</p>
			<p class="text-xs text-[var(--color-text-muted)]">Callback: {data.redirectUri}</p>

			<Button href="/" variant="secondary" size="lg">Go to Homepage</Button>
		</div>
	</SurfaceCard>
</div>
