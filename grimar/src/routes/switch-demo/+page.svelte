<script lang="ts">
	import { Switch } from '$lib/components/ui/switch/index.js';

	let controlledValue = $state(false);
</script>

<div class="p-8">
	<h1 class="text-2xl font-bold mb-4">Switch Component Demo</h1>

	<!-- Basic switch without label -->
	<div class="mb-8">
		<h2 class="text-lg font-semibold mb-2">Basic Switch</h2>
		<Switch />
	</div>

	<!-- Switch with label and description -->
	<div class="mb-8">
		<h2 class="text-lg font-semibold mb-2">Switch with Label & Description</h2>
		<Switch
			label="Dark Mode"
			description="Enable dark mode for the application"
			checked={true}
		/>
	</div>

	<!-- Disabled switch -->
	<div class="mb-8">
		<h2 class="text-lg font-semibold mb-2">Disabled Switch</h2>
		<Switch
			label="Disabled Toggle"
			description="This switch is disabled"
			checked={false}
			disabled={true}
		/>
	</div>

	<!-- Controlled switch -->
	<div class="mb-8">
		<h2 class="text-lg font-semibold mb-2">Controlled Switch</h2>
		<p class="mb-2 text-sm text-[var(--color-text-secondary)]">Value: {controlledValue ? 'On' : 'Off'}</p>
		<Switch
			bind:checked={controlledValue}
			label="Notifications"
			description="Receive push notifications"
		/>
	</div>
</div>
