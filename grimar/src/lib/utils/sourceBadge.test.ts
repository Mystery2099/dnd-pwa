import { describe, it, expect } from 'vitest';
import { getSourceBadgeClass, getSourceLabel } from '$lib/utils/sourceBadge';

describe('sourceBadge utilities', () => {
	describe('getSourceBadgeClass', () => {
		it('should return blue styling for open5e source', () => {
			const result = getSourceBadgeClass('open5e');

			expect(result).toContain('bg-blue-500/20');
			expect(result).toContain('text-blue-300');
			expect(result).toContain('border-blue-500/30');
		});

		it('should return amber styling for srd source', () => {
			const result = getSourceBadgeClass('srd');

			expect(result).toContain('bg-amber-500/20');
			expect(result).toContain('text-amber-300');
			expect(result).toContain('border-amber-500/30');
		});

		it('should return purple styling for homebrew source', () => {
			const result = getSourceBadgeClass('homebrew');

			expect(result).toContain('bg-purple-500/20');
			expect(result).toContain('text-purple-300');
			expect(result).toContain('border-purple-500/30');
		});

		it('should return gray styling for unknown source', () => {
			const result = getSourceBadgeClass('custom');

			expect(result).toContain('bg-gray-500/20');
			expect(result).toContain('text-gray-300');
			expect(result).toContain('border-gray-500/30');
		});

		it('should return gray styling for empty source', () => {
			const result = getSourceBadgeClass('');

			expect(result).toContain('bg-gray-500/20');
			expect(result).toContain('text-gray-300');
		});

		it('should handle case variations', () => {
			const result = getSourceBadgeClass('HOME BREW');

			expect(result).toContain('bg-gray-500/20');
		});
	});

	describe('getSourceLabel', () => {
		it('should return "Open5e" for open5e source', () => {
			const result = getSourceLabel('open5e');

			expect(result).toBe('Open5e');
		});

		it('should return "SRD" for srd source', () => {
			const result = getSourceLabel('srd');

			expect(result).toBe('SRD');
		});

		it('should return "Homebrew" for homebrew source', () => {
			const result = getSourceLabel('homebrew');

			expect(result).toBe('Homebrew');
		});

		it('should capitalize first letter of unknown source', () => {
			const result = getSourceLabel('custom');

			expect(result).toBe('Custom');
		});

		it('should handle single character source', () => {
			const result = getSourceLabel('a');

			expect(result).toBe('A');
		});

		it('should handle empty string', () => {
			const result = getSourceLabel('');

			expect(result).toBe('');
		});

		it('should preserve case for custom sources beyond first letter', () => {
			const result = getSourceLabel('myCustomSource');

			expect(result).toBe('MyCustomSource');
		});
	});
});
