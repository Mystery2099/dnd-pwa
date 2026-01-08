import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import VirtualListTestWrapper from './VirtualListTestWrapper.svelte';

describe('VirtualList', () => {
	it('renders virtualized items', async () => {
		const items = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));

		const { container } = render(VirtualListTestWrapper, {
			props: { items }
		});

		const listEl = container.querySelector('.virtual-list-container') as HTMLElement;
		Object.defineProperty(listEl, 'clientHeight', { value: 400 });

		window.dispatchEvent(new Event('resize'));

		// Wait for virtualizer
		await new Promise((resolve) => setTimeout(resolve, 50));

		// Total size should be 100 * 40 = 4000
		const inner = container.querySelector('.virtual-list-inner') as HTMLElement;
		expect(inner.style.height).toBe('4000px');
	});
});
