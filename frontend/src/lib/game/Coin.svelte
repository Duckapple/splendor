<script lang="ts">
	import { bgColorOf, ringColorOf } from '$lib/color';
	import type { Color } from '../../../../common/model';

	export let color: Color;
	export let stackSize = 1;
	export let hideNumber = false;
	export let small = false;

	const coinMd = 'md:text-4xl md:h-24 md:w-24 md:-mb-[6.5rem] md:ring-4';
	const boxMd = 'md:h-24 md:w-24';
</script>

<button
	data-coin-color={color}
	on:click
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
