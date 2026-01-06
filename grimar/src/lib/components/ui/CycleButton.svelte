<script lang="ts">
	import { ChevronDown, ChevronUp } from 'lucide-svelte';

	interface Option {
		value: string;
		label: string;
		description?: string;
	}

	type Props = {
		value: string;
		options: readonly Option[];
		onchange?: (value: string) => void;
		class?: string;
		size?: 'sm' | 'md' | 'lg';
		variant?: 'default' | 'gem';
	};

	let {
		value,
		options,
		onchange,
		class: className = '',
		size = 'md',
		variant = 'default'
	}: Props = $props();

	const sizeClasses = {
		sm: 'text-xs px-2 py-1',
		md: 'text-sm px-3 py-1.5',
		lg: 'text-base px-4 py-2'
	};

	const variantClasses = {
		default: 'bg-[var(--color-bg-card)] border border-white/10 hover:border-[var(--color-accent)]/50',
		gem: 'btn-3d bg-[var(--color-bg-card)]'
	};

	function getCurrentOption() {
		return options.find((opt) => opt.value === value) || options[0];
	}

	function cycle(direction: 'next' | 'prev') {
		const currentIndex = options.findIndex((opt) => opt.value === value);
		let newIndex: number;

		if (direction === 'next') {
			newIndex = (currentIndex + 1) % options.length;
		} else {
			newIndex = (currentIndex - 1 + options.length) % options.length;
		}

		value = options[newIndex].value;
		onchange?.(value);
	}

	function handleClick(e: MouseEvent) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const third = rect.width / 3;

		if (clickX < third) {
			cycle('prev');
		} else if (clickX > third * 2) {
			cycle('next');
		} else {
			// Middle click - just cycle to next
			cycle('next');
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
			e.preventDefault();
			cycle('next');
		} else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
			e.preventDefault();
			cycle('prev');
		} else if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault();
			cycle('next');
		}
	}
</script>

<button
	type="button"
	class="inline-flex items-center gap-2 rounded-xl font-medium transition-all active:scale-95 select-none {sizeClasses[size]} {variantClasses[variant]} {className}"
	onclick={handleClick}
	onkeydown={handleKeydown}
	aria-label="Cycle option: {getCurrentOption().label}"
	title="Click left/right edges to cycle, or use arrow keys"
>
	<span class="flex-1 text-left">{getCurrentOption().label}</span>

	<div class="flex flex-col items-center gap-0">
		<ChevronUp class="text-[var(--color-text-muted)]" style="width: 10px; height: 10px;" />
		<ChevronDown class="text-[var(--color-text-muted)]" style="width: 10px; height: 10px;" />
	</div>
</button>
