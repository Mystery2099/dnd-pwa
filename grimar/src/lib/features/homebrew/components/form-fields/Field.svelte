<script lang="ts">
	import type { FieldConfig } from './types';
	import StringField from './StringField.svelte';
	import NumberField from './NumberField.svelte';
	import BooleanField from './BooleanField.svelte';
	import TextareaField from './TextareaField.svelte';
	import EnumField from './EnumField.svelte';
	import ArrayField from './ArrayField.svelte';

	type Props = {
		config: FieldConfig;
		value: unknown;
		onChange: (value: unknown) => void;
	};

	let { config, value, onChange }: Props = $props();

	const fieldId = $derived(`field-${config.name}`);
</script>

{#if config.type === 'string'}
	<StringField {config} {fieldId} {value} {onChange} />
{:else if config.type === 'number'}
	<NumberField {config} {fieldId} {value} {onChange} />
{:else if config.type === 'boolean'}
	<BooleanField {config} {fieldId} {value} {onChange} />
{:else if config.type === 'textarea'}
	<TextareaField {config} {fieldId} {value} {onChange} />
{:else if config.type === 'enum'}
	<EnumField {config} {fieldId} {value} {onChange} />
{:else if config.type === 'array'}
	<ArrayField {config} {fieldId} {value} {onChange} />
{:else}
	<StringField {config} {fieldId} {value} {onChange} />
{/if}