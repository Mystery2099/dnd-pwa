export type SheetSide = 'top' | 'right' | 'bottom' | 'left';
export type SheetVariant = 'sheet' | 'drawer' | 'dialog';
export type OverlayVariant = 'default' | 'blur' | 'transparent';
export type DragConstraint = 'none' | 'content' | 'handle';

export interface SheetDragState {
	isDragging: boolean;
	delta: number;
	velocity: number;
	direction: number;
}

export interface SheetRootProps {
	open?: boolean;
	side?: SheetSide;
	snapPoints?: number[];
	closeThreshold?: number;
	dismissible?: boolean;
}

export interface SheetContentProps {
	side?: SheetSide;
	variant?: SheetVariant;
	overlayVariant?: OverlayVariant;
	overlayBlur?: 'sm' | 'md' | 'lg' | 'xl';
	overlayClass?: string;
	closeClass?: string;
	showCloseButton?: boolean;
	showHandle?: boolean;
	handleClass?: string;
	closeThreshold?: number;
	dragConstraint?: DragConstraint;
	onDragStart?: (state: SheetDragState) => void;
	onDragMove?: (state: SheetDragState) => void;
	onDragEnd?: (state: SheetDragState, willClose: boolean) => void;
}

export interface SheetOverlayProps {
	variant?: OverlayVariant;
	blurAmount?: 'sm' | 'md' | 'lg' | 'xl';
}