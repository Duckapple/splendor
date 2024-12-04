<script lang="ts">
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	import { bgColorOf, ringColorOf } from '$lib/color';
	import type { Color } from '../../../../common/model';
	import type { KeyboardEventHandler, MouseEventHandler } from 'svelte/elements';

	interface Props {
		color: Color;
		stackSize?: number;
		hideNumber?: boolean;
		small?: boolean;
		onclick?: MouseEventHandler<HTMLButtonElement> | null;
		onkeypress?: KeyboardEventHandler<HTMLButtonElement> | null;
	}

	let {
		color,
		stackSize = 1,
		hideNumber = false,
		small = false,
		onclick,
		onkeypress,
	}: Props = $props();

	const coinMd = 'md:text-4xl md:h-24 md:w-24 md:-mb-[6.5rem] md:ring-4';
	const boxMd = 'md:h-24 md:w-24';
</script>

<button
	data-coin-color={color}
	{onclick}
	{onkeypress}
	class="{!small && boxMd} flex flex-col w-10 h-10 transition-[transform,opacity] group"
>
	{#each Array(stackSize) as _, i}
		<div
			class="{!small &&
				coinMd} h-10 w-10 select-none transition-transform flex justify-center items-center last:mb-0 -mb-11 last:group-hover:-translate-y-2 rounded-full aspect-square ring-2 {bgColorOf[
				color
			]} {ringColorOf[color]} z-[{i}]"
		>
			{!hideNumber && i + 1 === stackSize ? stackSize : ''}
		</div>
	{/each}
</button>
