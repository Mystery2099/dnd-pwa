<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import XIcon from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';
	import SheetPortal from './sheet-portal.svelte';
	import SheetOverlay from './sheet-overlay.svelte';
	import type { SheetSide } from './types.js';

	type SheetVariant = 'sheet' | 'drawer' | 'dialog';

	const variantClasses: Record<SheetVariant, string> = {
		sheet: 'rounded-t-2xl border-x-0 border-b-0',
		drawer: 'rounded-l-2xl rounded-r-none border-y-0 border-l-0',
		dialog: 'rounded-xl border'
	};

	const sidePositionClasses: Record<SheetSide, string> = {
		top: 'inset-x-0 top-0 w-full',
		right: 'inset-y-0 right-0 h-full',
		bottom: 'inset-x-0 bottom-0 w-full',
		left: 'inset-y-0 left-0 h-full'
	};

	let {
		ref = $bindable(null),
		class: className = '',
		side = 'right' as SheetSide,
		variant = 'sheet' as SheetVariant,
		overlayVariant = 'default' as 'default' | 'blur' | 'transparent',
		overlayBlur = 'md' as 'sm' | 'md' | 'lg' | 'xl',
		overlayClass = '',
		closeClass = '',
		portalProps,
		children,
		showCloseButton = true,
		showHandle = true,
		handleClass = '',
		closeThreshold = 0.4,
		dragConstraint = 'content' as 'none' | 'content' | 'handle',
		onDragStart,
		onDragMove,
		onDragEnd
	}: DialogPrimitive.ContentProps & {
		side?: SheetSide;
		variant?: SheetVariant;
		overlayVariant?: 'default' | 'blur' | 'transparent';
		overlayBlur?: 'sm' | 'md' | 'lg' | 'xl';
		overlayClass?: string;
		closeClass?: string;
		portalProps?: Record<string, unknown>;
		children?: Snippet;
		showCloseButton?: boolean;
		showHandle?: boolean;
		handleClass?: string;
		closeThreshold?: number;
		dragConstraint?: 'none' | 'content' | 'handle';
		onDragStart?: (state: { isDragging: boolean; delta: number; velocity: number; direction: number }) => void;
		onDragMove?: (state: { isDragging: boolean; delta: number; velocity: number; direction: number }) => void;
		onDragEnd?: (state: { isDragging: boolean; delta: number; velocity: number; direction: number }, willClose: boolean) => void;
	} = $props();

	let contentEl: HTMLElement | null = $state(null);
	let dragging = $state(false);
	let dragDelta = $state(0);
	let dragStart = $state(0);
	let lastMove = $state(0);
	let velocity = $state(0);
	let dragDirection = $state(1);

	function getAxis(): 'x' | 'y' {
		return side === 'top' || side === 'bottom' ? 'y' : 'x';
	}

	function getSign(): number {
		return side === 'top' || side === 'left' ? -1 : 1;
	}

	function isValidDragTarget(target: HTMLElement): boolean {
		if (dragConstraint === 'none') return false;
		if (dragConstraint === 'handle') return !!target.closest('[data-sheet-handle]');
		return true;
	}

	function isInteractiveElement(target: HTMLElement): boolean {
		return !!target.closest('[data-sheet-close], [data-sheet-ignore], button, a, input, select, textarea, [contenteditable]');
	}

	function handlePointerDown(e: PointerEvent) {
		if (e.button !== 0) return;
		if (!isValidDragTarget(e.target as HTMLElement)) return;
		if (isInteractiveElement(e.target as HTMLElement)) return;

		dragging = true;
		dragStart = getAxis() === 'y' ? e.clientY : e.clientX;
		lastMove = Date.now();
		velocity = 0;
		dragDirection = getSign();
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

		onDragStart?.({ isDragging: true, delta: 0, velocity: 0, direction: dragDirection });
	}

	function handlePointerMove(e: PointerEvent) {
		if (!dragging) return;
		const axis = getAxis();
		const current = axis === 'y' ? e.clientY : e.clientX;
		const delta = (current - dragStart) * getSign();
		const now = Date.now();
		const dt = now - lastMove;
		if (dt > 0) velocity = Math.abs(delta) / dt * 1000;
		lastMove = now;
		dragDelta = Math.max(0, delta);

		onDragMove?.({ isDragging: true, delta: dragDelta, velocity, direction: dragDirection });
	}

	function handlePointerUp() {
		if (!dragging) return;
		dragging = false;

		const windowSize = getAxis() === 'y' ? window.innerHeight : window.innerWidth;
		const threshold = typeof closeThreshold === 'number' ? closeThreshold * windowSize : 100;
		const willClose = dragDelta > threshold || velocity > 500;

		onDragEnd?.({ isDragging: false, delta: dragDelta, velocity, direction: dragDirection }, willClose);

		if (willClose && contentEl) {
			contentEl.dispatchEvent(new CustomEvent('sheetclose', { bubbles: true }));
		}

		dragDelta = 0;
		velocity = 0;
	}

	function getTransform(): string {
		const axis = getAxis();
		if (axis === 'y') return `translateY(${side === 'top' ? -dragDelta : dragDelta}px)`;
		return `translateX(${side === 'left' ? -dragDelta : dragDelta}px)`;
	}

	let variantClass = $derived(variantClasses[variant] ?? variantClasses.sheet);
	let positionClass = $derived(sidePositionClasses[side] ?? sidePositionClasses.right);
	let dragStyle = $derived(
		dragging
			? `transform: ${getTransform()}; transition: none;`
			: dragDelta > 0
				? `transform: ${getTransform()}; transition: transform 350ms cubic-bezier(0.32, 0.72, 0, 1);`
				: ''
	);
</script>

<SheetPortal {...portalProps}>
	<SheetOverlay variant={overlayVariant} blurAmount={overlayBlur} class={overlayClass} />
	<DialogPrimitive.Content
		bind:ref
		data-slot="sheet-content"
		data-side={side}
		data-variant={variant}
		class={cn(
			'fixed z-50 flex flex-col border bg-[var(--color-bg-card)] shadow-[0_0_40px_var(--color-shadow)] backdrop-blur-xl touch-none',
			positionClass,
			variantClass,
			'cursor-grab active:cursor-grabbing select-none',
			className
		)}
		style={dragStyle}
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerUp}
	>
		{#if showHandle}
			<div
				data-sheet-handle
				class={cn(
					'pointer-events-auto absolute flex justify-center z-10',
					side === 'top' ? 'inset-x-0 top-0 pt-3' :
					side === 'bottom' ? 'inset-x-0 bottom-0 pb-3' :
					'inset-x-0 top-0 pt-3'
				)}
			>
				<div
					class={cn(
						'h-1.5 w-12 rounded-full bg-[var(--color-border)] transition-all duration-150',
						dragging && 'scale-110 bg-[var(--color-accent)]',
						handleClass
					)}
				></div>
			</div>
		{/if}

		<div class="flex-1 overflow-y-auto overscroll-contain">
			{@render children?.()}
		</div>

		{#if showCloseButton}
			<DialogPrimitive.Close
				data-sheet-close
				class={cn(
					'absolute top-4 right-4 rounded-sm opacity-70 ring-offset-[var(--color-bg-card)] transition-all hover:opacity-100 focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-[var(--color-bg-surface)]',
					closeClass
				)}
			>
				<XIcon class="size-4 text-[var(--color-text-muted)]" />
				<span class="sr-only">Close</span>
			</DialogPrimitive.Close>
		{/if}
	</DialogPrimitive.Content>
</SheetPortal>