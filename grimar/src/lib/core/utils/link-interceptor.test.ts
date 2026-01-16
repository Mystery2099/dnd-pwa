import { describe, it, expect } from 'vitest';
import { open5eToInternalPath, createLinkInterceptor } from './link-interceptor';

describe('link-interceptor', () => {
	describe('open5eToInternalPath', () => {
		it('should convert api.open5e.com creature URL to internal path', () => {
			const result = open5eToInternalPath('https://api.open5e.com/monsters/ancient-red-dragon');
			expect(result).toBe('/compendium/creature/ancient-red-dragon');
		});

		it('should convert api.open5e.com spell URL to internal path', () => {
			const result = open5eToInternalPath('https://api.open5e.com/spells/fireball');
			expect(result).toBe('/compendium/spell/fireball');
		});

		it('should convert open5e.com URL to internal path', () => {
			const result = open5eToInternalPath('https://open5e.com/monsters/shadow');
			expect(result).toBe('/compendium/creature/shadow');
		});

		it('should handle multi-part slugs', () => {
			const result = open5eToInternalPath('https://api.open5e.com/items/robe-of-the-archmagi');
			expect(result).toBe('/compendium/item/robe-of-the-archmagi');
		});

		it('should return null for non-open5e URLs', () => {
			const result = open5eToInternalPath('https://dndbeyond.com/spells/fireball');
			expect(result).toBeNull();
		});

		it('should return null for unknown compendium types', () => {
			const result = open5eToInternalPath('https://api.open5e.com/vehicles/ancient-ship');
			expect(result).toBeNull();
		});

		it('should return null for invalid URLs', () => {
			expect(open5eToInternalPath('not-a-url')).toBeNull();
		});

		it('should return null for URLs with insufficient path segments', () => {
			expect(open5eToInternalPath('https://api.open5e.com/monsters')).toBeNull();
		});

		it('should handle URLs with query strings', () => {
			const result = open5eToInternalPath('https://api.open5e.com/spells/fireball?version=1.0');
			expect(result).toBe('/compendium/spell/fireball');
		});

		it('should handle URLs with trailing slashes', () => {
			const result = open5eToInternalPath('https://api.open5e.com/spells/fireball/');
			expect(result).toBe('/compendium/spell/fireball');
		});

		// v2 URL tests
		it('should convert api.open5e.com/v2 creature URL to internal path', () => {
			const result = open5eToInternalPath('https://api.open5e.com/v2/creatures/ancient-red-dragon');
			expect(result).toBe('/compendium/creature/ancient-red-dragon');
		});

		it('should convert api.open5e.com/v2 species URL to internal path', () => {
			const result = open5eToInternalPath('https://api.open5e.com/v2/species/elf');
			expect(result).toBe('/compendium/race/elf');
		});
	});

	describe('createLinkInterceptor', () => {
		it('should create a renderer with onclick handler', () => {
			const interceptor = createLinkInterceptor();

			expect(interceptor.component).toBe('a');
			expect(typeof interceptor.props.onclick).toBe('function');
		});

		it('should call onInternal callback for open5e URLs', () => {
			const onInternal = vi.fn();
			const interceptor = createLinkInterceptor({ onInternal });

			// Get the onclick handler
			const props = { href: 'https://api.open5e.com/spells/fireball' };
			const onclick = interceptor.props.onclick(props);

			// Create mock event
			const event = { preventDefault: vi.fn() } as unknown as MouseEvent;
			onclick(event);

			expect(event.preventDefault).toHaveBeenCalled();
			expect(onInternal).toHaveBeenCalledWith('/compendium/spell/fireball');
		});

		it('should call onExternal callback for external URLs', () => {
			const onExternal = vi.fn();
			const interceptor = createLinkInterceptor({ onExternal });

			const props = { href: 'https://dndbeyond.com' };
			const onclick = interceptor.props.onclick(props);

			const event = { preventDefault: vi.fn() } as unknown as MouseEvent;
			onclick(event);

			expect(event.preventDefault).toHaveBeenCalled();
			expect(onExternal).toHaveBeenCalledWith('https://dndbeyond.com');
		});

		it('should pass href to props', () => {
			const interceptor = createLinkInterceptor();
			const props = { href: '/test/path' };

			expect(interceptor.props.href(props)).toBe('/test/path');
		});

		it('should handle empty options', () => {
			const interceptor = createLinkInterceptor();

			const props = { href: 'https://api.open5e.com/spells/fireball' };
			const onclick = interceptor.props.onclick(props);

			// Should not throw and should not call callbacks
			const event = { preventDefault: vi.fn() } as unknown as MouseEvent;
			onclick(event);

			expect(event.preventDefault).toHaveBeenCalled();
		});
	});
});
