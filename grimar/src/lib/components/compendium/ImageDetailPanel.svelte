<script lang="ts">
	interface Props {
		title: string;
		imageAssetUrl: string | null;
		altText?: string;
		attribution?: string;
		documentLabel?: string;
		publisher?: string;
		gameSystem?: string;
		permalink?: string;
	}

	let {
		title,
		imageAssetUrl,
		altText,
		attribution,
		documentLabel,
		publisher,
		gameSystem,
		permalink
	}: Props = $props();
</script>

<div class="border-b border-[var(--color-border)] p-6">
	<div class="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
		<div class="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white/95 p-6">
			{#if imageAssetUrl}
				<img
					src={imageAssetUrl}
					alt={altText ?? title}
					class="h-auto max-h-[26rem] w-full object-contain"
					loading="eager"
				/>
			{:else}
				<div
					class="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)]/40 px-6 text-center text-sm text-[var(--color-text-muted)]"
				>
					Image preview unavailable
				</div>
			{/if}
		</div>

		<div class="space-y-4">
			{#if altText || attribution}
				<div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
					<h2 class="text-lg font-semibold text-[var(--color-text-primary)]">Image Data</h2>
					<dl class="mt-3 space-y-3">
						{#if altText}
							<div>
								<dt class="text-xs font-medium text-[var(--color-text-muted)] uppercase">
									Alt Text
								</dt>
								<dd class="mt-1 text-sm text-[var(--color-text-primary)]">{altText}</dd>
							</div>
						{/if}
						{#if attribution}
							<div>
								<dt class="text-xs font-medium text-[var(--color-text-muted)] uppercase">
									Attribution
								</dt>
								<dd class="mt-1 text-sm text-[var(--color-text-primary)]">{attribution}</dd>
							</div>
						{/if}
					</dl>
				</div>
			{/if}

			{#if documentLabel || publisher || gameSystem || permalink}
				<div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
					<h2 class="text-lg font-semibold text-[var(--color-text-primary)]">Source Document</h2>
					<dl class="mt-3 space-y-3">
						{#if documentLabel}
							<div>
								<dt class="text-xs font-medium text-[var(--color-text-muted)] uppercase">
									Document
								</dt>
								<dd class="mt-1 text-sm text-[var(--color-text-primary)]">{documentLabel}</dd>
							</div>
						{/if}
						{#if publisher}
							<div>
								<dt class="text-xs font-medium text-[var(--color-text-muted)] uppercase">
									Publisher
								</dt>
								<dd class="mt-1 text-sm text-[var(--color-text-primary)]">{publisher}</dd>
							</div>
						{/if}
						{#if gameSystem}
							<div>
								<dt class="text-xs font-medium text-[var(--color-text-muted)] uppercase">
									Game System
								</dt>
								<dd class="mt-1 text-sm text-[var(--color-text-primary)]">{gameSystem}</dd>
							</div>
						{/if}
						{#if permalink}
							<div>
								<dt class="text-xs font-medium text-[var(--color-text-muted)] uppercase">
									Permalink
								</dt>
								<dd class="mt-1 text-sm">
									<a
										href={permalink}
										target="_blank"
										rel="noreferrer"
										class="break-all text-accent transition-colors hover:text-accent/80"
									>
										{permalink}
									</a>
								</dd>
							</div>
						{/if}
					</dl>
				</div>
			{/if}
		</div>
	</div>
</div>
