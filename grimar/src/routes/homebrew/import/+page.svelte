<script lang="ts">
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { Upload, FileText, X } from 'lucide-svelte';

	let importing = $state(false);
	let message = $state('');
	let error = $state('');
	let isDragging = $state(false);
	let selectedFiles = $state<File[]>([]);
	let inputRef = $state<HTMLInputElement | undefined>(undefined);

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		const files = Array.from(e.dataTransfer?.files || []).filter(f => f.type === 'application/json' || f.name.endsWith('.json'));
		if (files.length > 0) {
			selectedFiles = files;
		}
	}

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		selectedFiles = Array.from(target.files || []);
	}

	function removeFile(index: number) {
		selectedFiles = selectedFiles.toSpliced(index, 1);
	}

	async function handleImport() {
		if (selectedFiles.length === 0) return;

		importing = true;
		message = '';
		error = '';

		let totalSuccess = 0;
		let totalErrors = 0;

		for (const file of selectedFiles) {
			try {
				const formData = new FormData();
				formData.append('file', file);

				const response = await fetch('/api/homebrew/import', {
					method: 'POST',
					body: formData
				});

				const result = await response.json();

				if (response.ok) {
					totalSuccess += result.successCount || 0;
					totalErrors += result.errorCount || 0;
				} else {
					totalErrors++;
					error = (error ? error + '\n' : '') + `${file.name}: ${result.error || 'Import failed'}`;
				}
			} catch (e) {
				totalErrors++;
				error = (error ? error + '\n' : '') + `${file.name}: Failed to upload`;
			}
		}

		if (totalSuccess > 0) {
			message = `Successfully imported ${totalSuccess} item(s).${totalErrors > 0 ? ` ${totalErrors} failed.` : ''}`;
			selectedFiles = [];
			if (inputRef) inputRef.value = '';
		}

		importing = false;
	}
</script>

<svelte:head>
	<title>Import Homebrew</title>
</svelte:head>

<div class="container mx-auto max-w-2xl p-4">
	<div class="mb-6">
		<a href="/homebrew" class="text-[var(--color-text-secondary)] hover:underline">&larr; Back to Homebrew</a>
	</div>

	<h1 class="mb-6 text-3xl font-bold text-[var(--color-text-primary)]">Import Homebrew</h1>

	<SurfaceCard class="bg-[var(--color-bg-card)] p-6">
		<div class="space-y-6">
			<div
				class="relative border-2 border-dashed rounded-xl p-8 text-center transition-all {isDragging
					? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
					: 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50'}"
				role="button"
				tabindex="0"
				ondragover={handleDragOver}
				ondragleave={handleDragLeave}
				ondrop={handleDrop}
				onclick={() => inputRef?.click()}
				onkeydown={(e) => e.key === 'Enter' && inputRef?.click()}
			>
				<input
					type="file"
					accept=".json"
					multiple
					bind:this={inputRef}
					onchange={handleFileSelect}
					class="hidden"
				/>

				<div class="flex flex-col items-center gap-3">
					<Upload class="size-12 text-[var(--color-text-secondary)]" />
					<div>
						<p class="text-lg font-medium text-[var(--color-text-primary)]">
							{isDragging ? 'Drop files here' : 'Drag & drop JSON files'}
						</p>
						<p class="text-sm text-[var(--color-text-secondary)] mt-1">
							or click to browse
						</p>
					</div>
				</div>

				{#if isDragging}
					<div class="absolute inset-0 bg-[var(--color-accent)]/20 rounded-xl pointer-events-none"></div>
				{/if}
			</div>

			{#if selectedFiles.length > 0}
				<div class="space-y-2">
					<p class="text-sm font-medium text-[var(--color-text-secondary)]">
						Selected files ({selectedFiles.length}):
					</p>
					<ul class="space-y-2">
						{#each selectedFiles as file, i (file.name + i)}
							<li class="flex items-center justify-between bg-[var(--color-bg-elevated)] rounded-lg px-4 py-2">
								<div class="flex items-center gap-3">
									<FileText class="size-5 text-[var(--color-text-secondary)]" />
									<span class="text-[var(--color-text-primary)]">{file.name}</span>
									<span class="text-xs text-[var(--color-text-secondary)]">
										({(file.size / 1024).toFixed(1)} KB)
									</span>
								</div>
								<button
									type="button"
									onclick={() => removeFile(i)}
									class="text-[var(--color-text-secondary)] hover:text-red-400 transition-colors"
									aria-label="Remove {file.name}"
								>
									<X class="size-5" />
								</button>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			<p class="text-sm text-[var(--color-text-secondary)]">
				Upload JSON files containing homebrew content. Each file can contain a single item or an array of items.
				The system will automatically detect the type (spell, monster, feat, etc.) based on the data structure.
			</p>

			{#if message}
				<div class="rounded-lg bg-green-900/30 border border-green-800/50 p-4 text-green-400">{message}</div>
			{/if}

			{#if error}
				<div class="rounded-lg bg-red-900/30 border border-red-800/50 p-4 text-red-400 whitespace-pre-line">{error}</div>
			{/if}

			<div class="flex gap-3">
				<Button
					onclick={handleImport}
					disabled={importing || selectedFiles.length === 0}
				>
					{importing ? 'Importing...' : `Import${selectedFiles.length > 1 ? ` ${selectedFiles.length} Files` : ''}`}
				</Button>
				{#if selectedFiles.length > 0}
					<Button
						variant="ghost"
						onclick={() => {
							selectedFiles = [];
							if (inputRef) inputRef.value = '';
						}}
						disabled={importing}
					>
						Clear
					</Button>
				{/if}
			</div>
		</div>
	</SurfaceCard>
</div>
