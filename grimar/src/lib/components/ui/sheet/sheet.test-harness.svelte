<script lang="ts">
	import * as Sheet from './index.js';

	let open = $state(true);
	let openChangeCount = $state(0);
	let lastOpenChange = $state<boolean | null>(null);

	function handleOpenChange(nextOpen: boolean) {
		openChangeCount += 1;
		lastOpenChange = nextOpen;
	}
</script>

<output data-testid="sheet-open">{open}</output>
<output data-testid="sheet-open-change">{openChangeCount}:{lastOpenChange}</output>
<button data-testid="sheet-reopen" onclick={() => (open = true)}>Reopen</button>

<Sheet.Root bind:open onOpenChange={handleOpenChange}>
	<Sheet.Content
		data-testid="sheet-content"
		side="bottom"
		closeThreshold={0.4}
		showCloseButton={false}
	>
		<Sheet.Title>Test sheet</Sheet.Title>
		<Sheet.Description>Drag interaction test</Sheet.Description>
	</Sheet.Content>
</Sheet.Root>
