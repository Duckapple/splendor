<script lang="ts">
	import { bgColorOf, ringColorOf } from '$lib/color';
	import type { Color } from '../../../../common/model';

	export let color: Color;
	export let stackSize = 1;
	export let hideNumber = false;
</script>

<button on:click class="flex flex-col w-10 h-10 md:h-24 md:w-24 group">
	{#each Array(stackSize) as _, i}
		<div
			class="md:text-4xl h-10 w-10 md:h-24 md:w-24 select-none transition-transform flex justify-center items-center last:mb-0 -mb-11 md:-mb-[6.5rem] last:group-hover:-translate-y-2 rounded-full aspect-square ring-2 md:ring-4 {bgColorOf[
				color
			]} {ringColorOf[color]} z-[{i}]"
		>
			{!hideNumber && i + 1 === stackSize ? stackSize : ''}
		</div>
	{/each}
</button>
