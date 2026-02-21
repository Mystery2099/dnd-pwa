<script lang="ts">
	import PageShell from '$lib/components/ui/PageShell.svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const typeLabels: Record<string, string> = {
		spell: 'Spells',
		monster: 'Monsters',
		item: 'Magic Items',
		feat: 'Feats',
		background: 'Backgrounds',
		race: 'Species',
		class: 'Classes'
	};

	const typeIcons: Record<string, string> = {
		spell: '✨',
		monster: '👹',
		item: '⚔️',
		feat: '💪',
		background: '📜',
		race: '🧬',
		class: '🎭'
	};

	function canEdit(item: { createdBy: string | null }): boolean {
		return data.user.role === 'admin' || item.createdBy === data.user.username;
	}

	async function deleteItem(itemKey: string, itemName: string) {
		if (!confirm(`Delete "${itemName}"? This cannot be undone.`)) return;

		try {
			const response = await fetch(`/api/homebrew/${encodeURIComponent(itemKey)}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				window.location.reload();
			} else {
				const result = await response.json();
				alert(result.error || 'Failed to delete');
			}
		} catch (_e) {
			alert('Failed to delete item');
		}
	}
</script>

<PageShell title="My Homebrew">
	<div class="mb-6 flex flex-wrap gap-2 sm:justify-end">
		<Button variant="ghost" href="/api/homebrew/export/all" download="homebrew-all.json">
			Export All
		</Button>
		<Button variant="ghost" href="/homebrew/import">Import</Button>
		<Button variant="gem" href="/homebrew/new">Create New</Button>
	</div>

	{#if data.items.length === 0}
		<div class="rounded-xl bg-[var(--color-bg-card)] p-8 text-center">
			<p class="mb-4 text-[var(--color-text-secondary)]">
				You haven't created any homebrew content yet.
			</p>
			<Button variant="gem" href="/homebrew/new">Create the First Item</Button>
		</div>
	{:else}
		<div class="mb-4 text-sm text-[var(--color-text-secondary)]">
			{data.items.length} item{data.items.length !== 1 ? 's' : ''}
		</div>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each Object.entries(data.itemsByType) as [type, items] (type)}
				<SurfaceCard class="bg-[var(--color-bg-card)] p-4">
					<div class="mb-3 flex items-center gap-2">
						<span class="text-2xl">{typeIcons[type] || '📦'}</span>
						<h2 class="text-xl font-semibold text-[var(--color-text-primary)]">
							{typeLabels[type] || type}
						</h2>
						<span
							class="ml-auto rounded-full bg-[var(--color-bg-elevated)] px-2 py-0.5 text-sm text-[var(--color-text-secondary)]"
						>
							{items.length}
						</span>
					</div>
					<ul class="space-y-2">
						{#each items as item (item.key)}
							<li class="rounded bg-[var(--color-bg-elevated)] p-2">
								<div class="flex items-center justify-between">
									<a
										href="/compendium/{item.type}/homebrew/{item.key}"
										class="text-[var(--color-text-primary)] hover:underline"
									>
										{item.name}
									</a>
									{#if canEdit(item)}
										<div class="flex gap-2">
											<a
												href="/homebrew/{item.key}/edit"
												class="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
											>
												Edit
											</a>
											<button
												onclick={() => deleteItem(item.key, item.name)}
												class="text-sm text-red-400 hover:text-red-300"
											>
												Delete
											</button>
										</div>
									{/if}
								</div>
								{#if item.createdBy}
									<p class="mt-1 text-xs text-[var(--color-text-muted)]">
										by {item.createdBy}
										{#if item.createdBy === data.user.username}
											<span class="text-[var(--color-accent)]">(you)</span>
										{/if}
									</p>
								{/if}
							</li>
						{/each}
					</ul>
				</SurfaceCard>
			{/each}
		</div>
	{/if}

	<div class="mt-8">
		<h2 class="mb-4 text-xl font-semibold text-[var(--color-text-primary)]">Export</h2>
		<Button variant="ghost" href="/api/homebrew/export/all" download="homebrew-all.json">
			Download All as JSON
		</Button>
	</div>
</PageShell>
