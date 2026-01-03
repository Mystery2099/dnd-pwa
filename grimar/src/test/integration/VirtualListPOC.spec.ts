import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
// @ts-ignore - POC doesn't exist yet
import VirtualListPOC from '$lib/components/POC/VirtualListPOC.svelte';

describe('VirtualListPOC', () => {
    it('renders a virtualized list', async () => {
        const { container } = render(VirtualListPOC);
        const listEl = container.querySelector('.list') as HTMLElement;
        
        // Mock dimensions
        Object.defineProperty(listEl, 'clientHeight', { value: 400 });
        Object.defineProperty(listEl, 'offsetHeight', { value: 400 });
        
        // Trigger a resize/scroll update if needed
        window.dispatchEvent(new Event('resize'));
        
        // Wait for Svelte and Virtualizer to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Expect to see some rows
        expect(screen.getByText(/Row 0/)).toBeDefined();
    });
});
