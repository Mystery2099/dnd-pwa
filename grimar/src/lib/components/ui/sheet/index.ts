export { default as Root } from './sheet.svelte';
export { default as Portal } from './sheet-portal.svelte';
export { default as Overlay } from './sheet-overlay.svelte';
export { default as Content } from './sheet-content.svelte';
export { default as Header } from './sheet-header.svelte';
export { default as Footer } from './sheet-footer.svelte';
export { default as Title } from './sheet-title.svelte';
export { default as Description } from './sheet-description.svelte';
export { default as Close } from './sheet-close.svelte';
export { default as Trigger } from './sheet-trigger.svelte';

export type {
	SheetSide,
	SheetVariant,
	OverlayVariant,
	DragConstraint,
	SheetDragState,
	SheetContentProps,
	SheetOverlayProps
} from './types.js';
