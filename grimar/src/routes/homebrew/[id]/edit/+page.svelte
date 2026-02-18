<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import HomebrewEditor from '$lib/features/homebrew/components/HomebrewEditor.svelte';

	let { data } = $props();

	let saving = $state(false);
	let error = $state('');

	const typeLabels: Record<string, string> = {
		spell: 'Spell',
		monster: 'Monster',
		magicitem: 'Magic Item',
		feat: 'Feat',
		background: 'Background',
		species: 'Species',
		class: 'Class',
		subclass: 'Subclass',
		subrace: 'Subrace',
		creatures: 'Creature'
	};

	async function handleSubmit(formData: Record<string, unknown>) {
		saving = true;
		error = '';

		try {
			const response = await fetch(`/api/homebrew/${data.item.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: formData.name,
					summary: formData.summary,
					jsonData: JSON.stringify(formData)
				})
			});

			const result = await response.json();

			if (response.ok) {
				goto('/homebrew');
			} else {
				error = result.error || 'Failed to save';
			}
		} catch (e) {
			error = 'Failed to save changes';
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>Edit {data.item.name} | Homebrew</title>
</svelte:head>

<div class="container mx-auto max-w-4xl p-4">
	<div class="mb-6">
		<a href="/homebrew" class="text-[var(--color-text-secondary)] hover:underline">
			&larr; Back to Homebrew
		</a>
	</div>

	<h1 class="mb-6 text-3xl font-bold text-[var(--color-text-primary)]">
		Edit {typeLabels[data.item.type] || data.item.type}
	</h1>

	{#if error}
		<div class="mb-4 rounded bg-red-900/30 p-3 text-red-400">{error}</div>
	{/if}

	{#if data.item.jsonData}
		<HomebrewEditor
			contentType={data.item.type}
			initialData={JSON.parse(data.item.jsonData)}
			{saving}
			onsubmit={handleSubmit}
		/>
	{:else}
		<p class="text-[var(--color-text-secondary)]">No data available to edit.</p>
	{/if}
</div>
