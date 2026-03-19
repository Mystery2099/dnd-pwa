import { cubicOut, linear } from 'svelte/easing';
import type { FadeParams, FlyParams } from 'svelte/transition';

export const motionDuration = {
	fast: 150,
	base: 200,
	slow: 300,
	paneOpen: 250,
	paneClose: 180,
	stagger: 50
} as const;

export const motionEase = {
	softOut: cubicOut,
	linearOut: linear,
	springOut: (t: number): number => {
		const c1 = 1.70158;
		const c3 = c1 + 1;
		return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
	}
} as const;

export function stagger(index: number, start: number = 0, step: number = motionDuration.stagger): number {
	return start + index * step;
}

export function fadeIn(
	delay: number = 0,
	duration: number = motionDuration.fast
): Pick<FadeParams, 'delay' | 'duration'> {
	return { delay, duration };
}

export function fadeUp(
	delay: number = 0,
	y: number = 10,
	duration: number = motionDuration.base
): Pick<FlyParams, 'delay' | 'duration' | 'y' | 'easing'> {
	return {
		delay,
		duration,
		y,
		easing: motionEase.softOut
	};
}

export function paneEnter(
	x: number = 420
): Pick<FlyParams, 'x' | 'duration' | 'easing'> {
	return {
		x,
		duration: motionDuration.paneOpen,
		easing: motionEase.springOut
	};
}

export function paneExit(
	x: number = 420
): Pick<FlyParams, 'x' | 'duration' | 'easing'> {
	return {
		x,
		duration: motionDuration.paneClose,
		easing: motionEase.linearOut
	};
}
