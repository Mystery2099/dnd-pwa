<script lang="ts">
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import { goto } from '$app/navigation';
	import HomebrewEditor from '$lib/features/homebrew/components/HomebrewEditor.svelte';

	const CONTENT_TYPES = ['spells', 'creatures', 'magicitems', 'feats', 'backgrounds', 'species', 'classes'] as const;
	type ContentType = (typeof CONTENT_TYPES)[number];

	let contentType = $state<ContentType>('spells');
	let error = $state('');
	let saving = $state(false);

	const typeLabels: Record<ContentType, string> = {
		spells: 'Spell',
		creatures: 'Creature',
		magicitems: 'Magic Item',
		feats: 'Feat',
		backgrounds: 'Background',
		species: 'Species',
		classes: 'Class'
	};

	async function handleEditorSubmit(formValues: Record<string, unknown>) {
		error = '';
		saving = true;

		try {
			const name = formValues.name as string;
			if (!name?.trim()) {
				throw new Error('Name is required');
			}

			const payload = {
				type: contentType,
				data: formValues
			};

			const res = await fetch('/api/homebrew', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || err.message || 'Failed to create');
			}

			goto('/homebrew');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create';
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>Create Homebrew | Grimar</title>
</svelte:head>

<div class="container mx-auto max-w-4xl p-4">
	<div class="mb-6">
		<a href="/homebrew" class="text-[var(--color-text-secondary)] hover:underline">&larr; Back to Community Homebrew</a>
	</div>

	<h1 class="mb-6 text-3xl font-bold text-[var(--color-text-primary)]">Create Homebrew</h1>

	<SurfaceCard class="mb-4 bg-[var(--color-bg-card)] p-6">
		<div class="mb-6">
			<label for="type" class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">
				Content Type
			</label>
			<select
				id="type"
				bind:value={contentType}
				class="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2 text-[var(--color-text-primary)]"
			>
				{#each Object.entries(typeLabels) as [value, label]}
					<option {value}>{label}</option>
				{/each}
			</select>
		</div>

		<div class="mb-6 border-t border-[var(--color-border)] pt-6">
			<h2 class="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
				{typeLabels[contentType]} Details
			</h2>
		<HomebrewEditor
				{contentType}
				initialData={{}}
				onsubmit={handleEditorSubmit}
			/>
		</div>

		{#if error}
			<div class="mb-4 rounded-lg bg-red-900/30 p-3 text-red-400">
				{error}
			</div>
		{/if}
	</SurfaceCard>
</div>
