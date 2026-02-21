<script lang="ts">
	import PageShell from '$lib/components/ui/PageShell.svelte';
	import { goto } from '$app/navigation';
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
			const response = await fetch(`/api/homebrew/${data.item.key}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: formData.name,
					description: formData.description,
					data: JSON.stringify(formData)
				})
			});

			const result = await response.json();

			if (response.ok) {
				goto('/homebrew');
			} else {
				error = result.error || 'Failed to save';
			}
		} catch (_e) {
			error = 'Failed to save changes';
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>Edit {data.item.name} | Homebrew</title>
</svelte:head>

<PageShell title="Edit {typeLabels[data.item.type] || data.item.type}">
	<div class="mb-6">
		<a href="/homebrew" class="text-[var(--color-text-secondary)] hover:underline">
			&larr; Back to Homebrew
		</a>
	</div>

	{#if error}
		<div class="mb-4 rounded bg-red-900/30 p-3 text-red-400">{error}</div>
	{/if}

	{#if data.item.data}
		<HomebrewEditor
			contentType={data.item.type}
			initialData={data.item.data}
			{saving}
			onsubmit={handleSubmit}
		/>
	{:else}
		<p class="text-[var(--color-text-secondary)]">No data available to edit.</p>
	{/if}
</PageShell>
