<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	type OverlayVariant = 'default' | 'blur' | 'transparent';
	type BlurAmount = 'sm' | 'md' | 'lg' | 'xl';

	const variantStyles: Record<OverlayVariant, string> = {
		default: 'bg-black/40',
		blur: 'bg-black/20',
		transparent: 'bg-transparent'
	};

	const blurClasses: Record<BlurAmount, string> = {
		sm: 'backdrop-blur-sm',
		md: 'backdrop-blur-md',
		lg: 'backdrop-blur-lg',
		xl: 'backdrop-blur-xl'
	};

	let {
		ref = $bindable(null),
		class: className = '',
		variant = 'default' as OverlayVariant,
		blurAmount = 'md' as BlurAmount,
		...restProps
	}: DialogPrimitive.OverlayProps & {
		variant?: OverlayVariant;
		blurAmount?: BlurAmount;
	} = $props();
</script>

<DialogPrimitive.Overlay
	bind:ref
	data-slot="sheet-overlay"
	data-variant={variant}
	class={cn(
		'fixed inset-0 z-50 transition-opacity duration-200',
		variantStyles[variant],
		variant === 'blur' && blurClasses[blurAmount],
		className
	)}
	{...restProps}
/>
