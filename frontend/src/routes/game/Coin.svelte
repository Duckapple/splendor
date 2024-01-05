<script lang="ts">
	import { bgColorOf } from '$lib/color';
	import type { Color } from '../../../../common/model';

	export let color: Color;
	export let stackSize = 1;
</script>

<div>
	{#each Array(stackSize) as _, i}
		<div
			class="md:text-4xl h-10 w-10 md:h-24 md:w-24 flex items-center last:mb-0 -mb-11 md:-mb-[6.5rem] last:hover:-translate-y-2 justify-center border border-black rounded-full aspect-square ring-white ring-2 md:ring-4 {bgColorOf[
				color
			]} z-[{i}]"
		>
			{i + 1 === stackSize ? stackSize : ''}
		</div>
	{/each}
</div>
