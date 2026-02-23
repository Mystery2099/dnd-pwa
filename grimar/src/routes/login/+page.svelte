<script lang="ts">
	import { Lock, LogIn, Terminal } from 'lucide-svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';

	let { data: _data } = $props();

	// Check if we're in dev mode with mock user
	const isDevMode = import.meta.env.DEV;
	const mockUser = import.meta.env.VITE_MOCK_USER;

	// Authentik configuration
	const authentikUrl = import.meta.env.VITE_AUTHENTIK_URL || 'https://authentik.mathewtech.us';
	const clientId = import.meta.env.VITE_AUTHENTIK_CLIENT_ID;
	const hasAuthentikConfig = !!clientId;
</script>

<svelte:head>
	<title>Sign In - Grimar</title>
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
			{#if isDevMode && mockUser && !hasAuthentikConfig}
				Development mode with mock user active.
			{:else}
				Sign in to access the Grimar compendium and character tools.
			{/if}
		</p>

		<!-- Dev Mode Info -->
		{#if isDevMode && mockUser && !hasAuthentikConfig}
			<div class="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-left">
				<div class="flex items-start gap-3">
					<Terminal class="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
					<div>
						<p class="text-sm font-medium text-emerald-200">Development Mode Active</p>
						<p class="mt-1 text-sm text-emerald-100/80">
							Signed in as <strong>{mockUser}</strong>
						</p>
					</div>
				</div>
			</div>
		{/if}

		<!-- Dev Mode: OAuth2 Flow Option -->
		{#if isDevMode && hasAuthentikConfig}
			<div class="mb-6 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-left">
				<div class="flex items-start gap-3">
					<Terminal class="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
					<div>
						<p class="text-sm font-medium text-blue-200">Development Mode</p>
						<p class="mt-1 text-sm text-blue-100/80">
							Authentik configured. You can test the OAuth2 flow locally.
						</p>
						<p class="mt-2 text-xs text-blue-100/60">
							Note: Authentik at {authentikUrl} must be accessible from your dev machine.
						</p>
					</div>
				</div>
			</div>
		{/if}

		<!-- Actions -->
		<div class="flex flex-col gap-3">
			{#if !isDevMode || hasAuthentikConfig || (!mockUser && !hasAuthentikConfig)}
				<Button href="/auth/login" variant="primary" size="lg">
					<LogIn class="size-5" />
					Sign In with Authentik
				</Button>
				{#if isDevMode}
					<p class="text-xs text-[var(--color-text-muted)]">
						Redirects to {authentikUrl}
					</p>
				{/if}
			{/if}

			<Button href="/" variant="secondary" size="lg">Go to Homepage</Button>
		</div>
	</SurfaceCard>
</div>
