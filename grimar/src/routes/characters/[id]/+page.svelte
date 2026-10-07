<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import { beforeNavigate } from '$app/navigation';
	import { createCharactersQuery } from '$lib/core/client/queries';
	import Button from '$lib/components/ui/Button.svelte';
	import SheetEditor from '$lib/features/characters/SheetEditor.svelte';
	let { data, form } = $props();
	let sheet = $state(structuredClone(untrack(() => data.sheet)));
	let name = $state(untrack(() => data.character.name));
	let baseline = $state(untrack(() => JSON.stringify({ name, sheet })));
	let loadedRevision = $state(untrack(() => data.revision));
	let loadedId = $state(untrack(() => data.character.id));
	let busy = $state(false);
	let ready = $state(false);
	onMount(() => {
		ready = true;
	});
	let saveError = $state('');
	let deleting = $state(false);
	const charactersQuery = createCharactersQuery();
	function exportSheet() {
		const blob = new Blob([JSON.stringify({ schemaVersion: 1, name, sheet }, null, 2)], {
			type: 'application/json'
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `character-${data.character.id}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}
	let importError = $state('');
	async function importSheet(event: Event) {
		const input = event.currentTarget as HTMLInputElement,
			file = input.files?.[0];
		if (!file) return;
		try {
			if (file.size > 150000) throw new Error('Sheet file must be under 150 KB.');
			const { characterSchema } = await import('$lib/features/characters/schema');
			const parsed = characterSchema.safeParse(JSON.parse(await file.text()));
			if (!parsed.success)
				throw new Error('Invalid sheet file. Import a Grimar character-sheet export.');
			name = parsed.data.name;
			sheet = parsed.data.sheet;
			importError = '';
		} catch (e) {
			importError = e instanceof Error ? e.message : 'Could not import sheet.';
		}
		input.value = '';
	}
	const payload = $derived(JSON.stringify({ name, sheet }));
	const dirty = $derived(payload !== baseline);
	$effect(() => {
		if (data.revision !== loadedRevision || data.character.id !== loadedId) {
			sheet = structuredClone(data.sheet);
			name = data.character.name;
			baseline = JSON.stringify({ name: data.character.name, sheet: data.sheet });
			loadedRevision = data.revision;
			loadedId = data.character.id;
		}
	});
	beforeNavigate(({ cancel }) => {
		if (dirty && !busy && !confirm('Leave without saving character changes?')) cancel();
	});
	function unload(e: BeforeUnloadEvent) {
		if (dirty) {
			e.preventDefault();
		}
	}
</script>

<svelte:head><title>{data.character.name} | Grimar</title></svelte:head>
<svelte:window onbeforeunload={unload} />
<div class="mx-auto max-w-6xl space-y-4 p-4 text-[var(--color-text-primary)]">
	<Button href="/characters" variant="ghost">My Characters</Button>
	<form
		method="POST"
		action="?/save"
		use:enhance={() => {
			busy = true;
			saveError = '';
			return async ({ update, result }) => {
				try {
					if (result.type === 'error') {
						saveError =
							'Could not save. Your changes remain here; retry when connected or export a backup.';
						return;
					}
					await update({ reset: false });
					if (result.type === 'success') await charactersQuery.refetch();
				} finally {
					busy = false;
				}
			};
		}}
		class="space-y-4"
	>
		<input type="hidden" name="payload" value={payload} /><input
			type="hidden"
			name="revision"
			value={loadedRevision}
		/>
		<div class="card-crystal flex flex-wrap items-end justify-between gap-3 p-5">
			<div class="min-w-0 flex-1">
				<h1 class="text-holo mb-2 text-2xl font-bold">Character Sheet</h1>
				<label class="block"
					>Character name<input
						class="input-crystal mt-1 w-full p-2"
						required
						maxlength="200"
						bind:value={name}
					/></label
				>
			</div>
			<Button type="submit" disabled={busy || !ready}>{busy ? 'Saving…' : 'Save character'}</Button>
			<p class="w-full text-sm text-[var(--color-text-muted)]" role="status">
				{dirty ? 'Unsaved changes. Save while connected to your server.' : 'All changes saved.'}
			</p>
			{#if saveError}<p class="w-full" role="alert">{saveError}</p>{/if}
			{#if form?.message}<p class="w-full" role={form.saved ? 'status' : 'alert'}>
					{form.message}
				</p>{/if}
		</div>
		<fieldset disabled={busy || !ready} class="min-w-0"><SheetEditor bind:sheet /></fieldset>
	</form>
	{#if Object.keys((data.character.inventory as object) || {}).length || Object.keys((data.character.spells as object) || {}).length}
		<details class="panel-inset p-4">
			<summary>Existing inventory and spell records</summary>
			<p class="mt-2 text-sm">
				These original records are preserved. Use the sheet fields to record your play notes.
			</p>
			<pre class="mt-3 overflow-auto text-sm">{JSON.stringify(
					{ inventory: data.character.inventory, spells: data.character.spells },
					null,
					2
				)}</pre>
		</details>
	{/if}
	<div class="panel-inset flex flex-wrap items-center gap-3 p-4">
		<Button variant="secondary" disabled={!ready} onclick={exportSheet}>Export sheet</Button><label
			>Import sheet<input
				class="mt-1 block max-w-full text-sm"
				type="file"
				accept="application/json,.json"
				onchange={importSheet}
			/></label
		>{#if importError}<p role="alert">{importError}</p>{/if}
	</div>
	<div class="panel-inset p-4">
		{#if deleting}
			<p class="mb-3">Permanently delete {data.character.name}?</p>
			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					busy = true;
					return async ({ update, result }) => {
						try {
							await update();
							if (result.type === 'redirect') await charactersQuery.refetch();
						} finally {
							busy = false;
						}
					};
				}}
				class="flex gap-3"
			>
				<input type="hidden" name="revision" value={loadedRevision} /><Button
					type="submit"
					variant="danger"
					disabled={busy || !ready}>Confirm deletion</Button
				><Button
					variant="ghost"
					onclick={() => {
						deleting = false;
					}}>Cancel deletion</Button
				>
			</form>
		{:else}<Button
				variant="danger"
				onclick={() => {
					deleting = true;
				}}>Delete character</Button
			>{/if}
	</div>
</div>
