import { createContext } from 'svelte';

type SheetContext = {
	close: () => void;
};

export const [getSheetContext, setSheetContext] = createContext<SheetContext>();
