<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { AutoForm } from './form-fields';
	import { getFieldsForType, type FieldConfig } from './form-fields/types';

	type Props = {
		contentType: string;
		initialData?: Record<string, unknown>;
		onsubmit: (data: Record<string, unknown>) => void;
		oncancel?: () => void;
		isEditing?: boolean;
		saving?: boolean;
	};

	let {
		contentType,
		initialData = {},
		onsubmit,
		oncancel,
		isEditing = false,
		saving = false
	}: Props = $props();

	let inputMode = $state<'form' | 'json'>('form');
	// svelte-ignore state_referenced_locally
	let formValues = $state<Record<string, unknown>>({ ...initialData });
	// svelte-ignore state_referenced_locally
	let jsonInput = $state(JSON.stringify(initialData, null, 2));
	let jsonError = $state('');
	let isDragging = $state(false);

	const fields = $derived(getFieldsForType(contentType));

	const CONTENT_TYPES = {
		spells: { label: 'Spell', icon: '✨' },
		creatures: { label: 'Creature', icon: '🐉' },
		magicitems: { label: 'Magic Item', icon: '💎' },
		feats: { label: 'Feat', icon: '⭐' },
		backgrounds: { label: 'Background', icon: '📜' },
		species: { label: 'Species', icon: '🧬' },
		classes: { label: 'Class', icon: '⚔️' },
		subclasses: { label: 'Subclass', icon: '🔱' },
		subraces: { label: 'Subrace', icon: '🌿' }
	} as const;

	const typeInfo = $derived(
		CONTENT_TYPES[contentType as keyof typeof CONTENT_TYPES] || { label: contentType, icon: '📝' }
	);

	function handleFormChange(field: string, value: unknown) {
		formValues[field] = value;
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (inputMode === 'json') {
			try {
				const parsed = JSON.parse(jsonInput);
				jsonError = '';
				onsubmit(parsed);
			} catch {
				jsonError = 'Invalid JSON format';
			}
		} else {
			onsubmit(formValues);
		}
	}

	function handleFileDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		const file = e.dataTransfer?.files[0];
		if (file) processFile(file);
	}

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) processFile(file);
	}

	function processFile(file: File) {
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const content = e.target?.result as string;
				jsonInput = content;
				inputMode = 'json';
				jsonError = '';
			} catch {
				jsonError = 'Failed to read file';
			}
		};
		reader.readAsText(file);
	}
</script>

<div class="mx-auto max-w-4xl">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="flex items-center gap-2 text-2xl font-bold">
			<span>{typeInfo.icon}</span>
			{isEditing ? 'Edit' : 'Create'}
			{typeInfo.label}
		</h1>
		<div class="flex gap-2">
			<button
				type="button"
				class="rounded-lg px-3 py-1.5 text-sm transition-all {inputMode === 'form'
					? 'bg-[var(--color-accent)] text-white'
					: 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)]'}"
				onclick={() => (inputMode = 'form')}
			>
				Form
			</button>
			<button
				type="button"
				class="rounded-lg px-3 py-1.5 text-sm transition-all {inputMode === 'json'
					? 'bg-[var(--color-accent)] text-white'
					: 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)]'}"
				onclick={() => (inputMode = 'json')}
			>
				JSON
			</button>
		</div>
	</div>

	<form onsubmit={handleSubmit} class="space-y-6">
		{#if inputMode === 'json'}
			<div
				class="relative"
				role="region"
				aria-label="JSON input area"
				ondragover={(e) => {
					e.preventDefault();
					isDragging = true;
				}}
				ondragleave={() => (isDragging = false)}
				ondrop={handleFileDrop}
			>
				<textarea
					bind:value={jsonInput}
					placeholder="Paste JSON here or drag & drop a file..."
					class="input-crystal h-96 w-full resize-none rounded-xl p-4 font-mono text-sm {isDragging
						? 'ring-2 ring-[var(--color-accent)]'
						: ''}"
				></textarea>
				{#if isDragging}
					<div
						class="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-[var(--color-accent)]/10"
					>
						<span class="text-lg font-medium">Drop file here</span>
					</div>
				{/if}
				<label class="absolute right-4 bottom-4 cursor-pointer">
					<input type="file" accept=".json" class="hidden" onchange={handleFileSelect} />
					<span
						class="rounded-lg bg-[var(--color-bg-card)] px-3 py-1.5 text-sm transition-all hover:bg-[var(--color-bg-card-hover)]"
					>
						Upload File
					</span>
				</label>
			</div>
			{#if jsonError}
				<p class="text-sm text-red-400">{jsonError}</p>
			{/if}
		{:else}
			<AutoForm fields={fields} values={formValues} onChange={handleFormChange} />
		{/if}

		<div class="flex gap-4 pt-4">
			<Button type="submit" variant="primary" disabled={saving}>
				{isEditing ? 'Save Changes' : 'Create'}
				{typeInfo.label}
			</Button>
			{#if oncancel}
				<Button type="button" variant="ghost" onclick={oncancel}>Cancel</Button>
			{/if}
		</div>
	</form>
</div>