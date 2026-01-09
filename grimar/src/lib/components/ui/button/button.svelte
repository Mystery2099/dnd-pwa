<script lang="ts" module>
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { type VariantProps, tv } from 'tailwind-variants';

	// Adapted for Arcane Aero design system
	export const buttonVariants = tv({
		base: "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 btn-3d",
		variants: {
			variant: {
				// Primary gem button with glow
				default:
					'bg-[var(--color-accent)] text-[var(--color-text-inverted)] shadow-[0_0_20px_var(--color-accent-glow)]',
				// Destructive action
				destructive:
					'bg-[var(--color-gem-ruby)] text-[var(--color-text-inverted)] shadow-[0_0_20px_var(--color-gem-ruby-glow,rgba(239,68,68,0.3))]',
				// Glass outline - fits Arcane Aero aesthetic
				outline:
					'bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:bg-[var(--color-bg-overlay)] hover:border-[var(--color-accent)]',
				// Secondary subtle button
				secondary: 'bg-[var(--color-bg-overlay)] text-[var(--color-text-primary)]',
				// Minimal hover interaction
				ghost:
					'bg-transparent hover:bg-[var(--color-bg-overlay)] hover:border-[var(--color-border)]',
				// Text link style
				link: 'text-[var(--color-accent)] underline-offset-4 hover:underline bg-transparent shadow-none'
			},
			size: {
				default: 'h-9 px-4 py-2',
				sm: 'h-8 rounded-md px-3 text-xs',
				lg: 'h-11 rounded-lg px-6',
				icon: 'size-9',
				'icon-sm': 'size-8',
				'icon-lg': 'size-10'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
	export type ButtonSize = VariantProps<typeof buttonVariants>['size'];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
		};
</script>

<script lang="ts">
	let {
		class: className,
		variant = 'default',
		size = 'default',
		ref = $bindable(null),
		href = undefined,
		type = 'button',
		disabled,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? 'link' : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
