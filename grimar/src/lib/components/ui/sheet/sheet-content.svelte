<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import XIcon from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';
	import { getSheetContext } from './context.js';
	import SheetOverlay from './sheet-overlay.svelte';
	import SheetPortal from './sheet-portal.svelte';
	import type { SheetDragState, SheetSide } from './types.js';

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

	const handlePositionClasses: Record<SheetSide, string> = {
		top: 'inset-x-0 top-0 pt-3',
		right: 'inset-x-0 top-0 pt-3',
		bottom: 'inset-x-0 bottom-0 pb-3',
		left: 'inset-x-0 top-0 pt-3'
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
		dragConstraint = 'handle' as 'none' | 'content' | 'handle',
		onDragStart,
		onDragMove,
		onDragEnd,
		style: styleProp,
		onpointerdown,
		onpointermove,
		onpointerup,
		onpointercancel,
		...restProps
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
		onDragStart?: (state: SheetDragState) => void;
		onDragMove?: (state: SheetDragState) => void;
		onDragEnd?: (state: SheetDragState, willClose: boolean) => void;
	} = $props();

	const sheet = getSheetContext();
	let dragging = $state(false);
	let dragDelta = $state(0);
	let dragStart = $state(0);
	let lastPosition = $state(0);
	let lastMoveTime = $state(0);
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
		return !!target.closest(
			'[data-sheet-close], [data-sheet-ignore], button, a, input, select, textarea, [contenteditable]'
		);
	}

	function handlePointerDown(event: PointerEvent) {
		if (event.button !== 0) return;
		if (!isValidDragTarget(event.target as HTMLElement)) return;
		if (isInteractiveElement(event.target as HTMLElement)) return;

		dragging = true;
		dragStart = getAxis() === 'y' ? event.clientY : event.clientX;
		lastPosition = dragStart;
		lastMoveTime = performance.now();
		velocity = 0;
		dragDirection = getSign();
		(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);

		onDragStart?.({ isDragging: true, delta: 0, velocity: 0, direction: dragDirection });
	}

	function handlePointerMove(event: PointerEvent) {
		if (!dragging) return;
		const current = getAxis() === 'y' ? event.clientY : event.clientX;
		const delta = (current - dragStart) * getSign();
		const now = performance.now();
		const elapsed = now - lastMoveTime;

		if (elapsed > 0) velocity = ((current - lastPosition) * getSign() * 1000) / elapsed;
		lastPosition = current;
		lastMoveTime = now;
		dragDelta = Math.max(0, delta);

		onDragMove?.({ isDragging: true, delta: dragDelta, velocity, direction: dragDirection });
	}

	function finishDrag(cancelled = false) {
		if (!dragging) return;
		dragging = false;

		const contentSize = getAxis() === 'y' ? ref?.offsetHeight : ref?.offsetWidth;
		const viewportSize = getAxis() === 'y' ? window.innerHeight : window.innerWidth;
		const threshold = closeThreshold * (contentSize || viewportSize);
		const willClose = !cancelled && (dragDelta > threshold || velocity > 500);

		onDragEnd?.(
			{ isDragging: false, delta: dragDelta, velocity, direction: dragDirection },
			willClose
		);

		dragDelta = 0;
		if (willClose) sheet.close();
		velocity = 0;
	}

	function getTransform(): string {
		if (getAxis() === 'y') return `translateY(${side === 'top' ? -dragDelta : dragDelta}px)`;
		return `translateX(${side === 'left' ? -dragDelta : dragDelta}px)`;
	}

	function serializeStyle(style: unknown): string {
		if (typeof style === 'string') return style;
		if (!style || typeof style !== 'object') return '';
		return Object.entries(style)
			.filter(([, value]) => value != null)
			.map(([property, value]) => {
				const cssProperty = property.startsWith('--')
					? property
					: property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
				return `${cssProperty}: ${String(value)}`;
			})
			.join('; ');
	}

	let variantClass = $derived(variantClasses[variant] ?? variantClasses.sheet);
	let positionClass = $derived(sidePositionClasses[side] ?? sidePositionClasses.right);
	let handlePositionClass = $derived(handlePositionClasses[side] ?? handlePositionClasses.right);
</script>

<SheetPortal {...portalProps}>
	<SheetOverlay variant={overlayVariant} blurAmount={overlayBlur} class={overlayClass} />
	<DialogPrimitive.Content {...restProps} bind:ref>
		{#snippet child({ props })}
			<div
				{...props}
				data-slot="sheet-content"
				data-side={side}
				data-variant={variant}
				class={cn(
					'fixed z-50 flex flex-col border bg-[var(--color-bg-card)] shadow-[0_0_40px_var(--color-shadow)] backdrop-blur-xl',
					positionClass,
					variantClass,
					className
				)}
				style={`${serializeStyle(props.style)}; ${serializeStyle(styleProp)}; transform: ${getTransform()}; transition: ${dragging ? 'none' : 'transform 350ms cubic-bezier(0.32, 0.72, 0, 1)'};`}
				onpointerdown={(event) => {
					onpointerdown?.(event);
					handlePointerDown(event);
				}}
				onpointermove={(event) => {
					onpointermove?.(event);
					handlePointerMove(event);
				}}
				onpointerup={(event) => {
					onpointerup?.(event);
					finishDrag();
				}}
				onpointercancel={(event) => {
					onpointercancel?.(event);
					finishDrag(true);
				}}
			>
				{#if showHandle}
					<div
						data-sheet-handle
						class={cn(
							'pointer-events-auto absolute z-10 flex cursor-grab touch-none justify-center select-none active:cursor-grabbing',
							handlePositionClass
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
			</div>
		{/snippet}
	</DialogPrimitive.Content>
</SheetPortal>
