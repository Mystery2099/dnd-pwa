<script lang="ts">
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { enhance } from '$app/forms';
	let { form } = $props();
</script>

<svelte:head><title>Create Character | Grimar</title></svelte:head>
<div class="mx-auto max-w-xl p-4">
	<SurfaceCard padding="p-6 md:p-8">
		<h1 class="text-holo mb-2 text-3xl font-bold">Create Character</h1>
		<p class="mb-6 text-[var(--color-text-muted)]">
			Start a blank 5e sheet, then enter your class, abilities, and equipment. Rules calculations
			follow the 2014 core rules; your GM decides exceptions.
		</p>
		<form method="POST" use:enhance class="space-y-4">
			<label class="block"
				>Character name<input
					class="input-crystal mt-2 w-full px-4 py-2"
					name="name"
					required
					maxlength="200"
					autocomplete="off"
				/></label
			>
			{#if form?.message}<p role="alert">{form.message}</p>{/if}
			<div class="flex flex-wrap gap-3">
				<Button type="submit">Create Character</Button><Button
					href="/characters"
					variant="secondary">Cancel</Button
				>
			</div>
		</form>
	</SurfaceCard>
</div>
