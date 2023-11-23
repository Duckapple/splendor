<script lang="ts">
	import type { Card } from '../../../../common/model';
	import { colorOf, gradientOf } from '$lib/color';
	export let card: Card;
	export let showCost = true;
	const { c, cost, id, p } = card;
	const filtered = cost.filter(Boolean);
	const cols = [' grid-cols-1', ' grid-cols-1', ' grid-cols-2 md:grid-cols-1', ' grid-cols-2'];
	let secondPos = -1;
	for (let i = 0; i < cost.length; i++) {
		if (cost[i]) {
			if (secondPos !== -1) {
				secondPos = i;
				break;
			}
			secondPos = i;
		}
	}
</script>

<div
	class={'flex flex-col justify-between w-16 h-24 transition-transform border border-black rounded-lg select-none md:w-32 md:h-48 md:text-3xl aspect-square hover:scale-110 bg-gradient-to-br ' +
		gradientOf[c]}
>
	<div class={'py-0.5 px-2 text-3xl md:text-6xl rounded-t-lg ' + colorOf[c]}>
		<span class={p ? '' : 'opacity-20'}>{p ?? '0'}</span>
	</div>
	<div
		class={'text-sm md:text-3xl md:leading-5 pl-1 md:pl-2 pb-1 md:pb-2 grid w-12 md:w-20 gap-1 leading-none md:gap-2' +
			cols[filtered.length - 1]}
	>
		{#each cost as co, i}
			{#if filtered.length === 3 && secondPos === i}
				<div class="md:hidden" />
			{/if}
			{#if showCost && co}
				<span
					class={'p-0.5 md:p-1 w-5 md:w-8 text-center border border-black rounded-full aspect-square outline outline-white outline-2 md:outline-[3px] ' +
						colorOf[i]}
				>
					{co}
				</span>
			{/if}
		{/each}
	</div>
</div>
