<script lang="ts">
	import { type Card } from '../../../../common/model';
	import { bgColorOf, gradientOf } from '$lib/color';

	export let stacked = false;
	export let card: Card;
	export let hideCost = false;
	export let small = false;

	$: filteredLength = card.cost.filter(Boolean).length;
	const cols = [' grid-cols-1', ' grid-cols-1', ' grid-cols-2 md:grid-cols-1', ' grid-cols-2'];
	$: secondPos = (() => {
		let x = -1;
		for (let i = 0; i < card.cost.length; i++) {
			if (card.cost[i]) {
				if (x !== -1) {
					x = i;
					break;
				}
				x = i;
			}
		}
		return x;
	})();
	$: cardStyle = !small ? 'md:w-32 md:h-48 md:text-3xl' : '';
	$: pointStyle = !small ? 'md:py-0.5 md:px-2 md:text-6xl' : '';
	$: costStyle = !small ? 'md:text-2xl md:leading-5 md:pl-2 md:pb-2 md:w-20' : '';
</script>

<button
	class="flex flex-col justify-between w-14 h-[5.5rem] first:mt-0 transition-transform rounded-lg border border-black select-none {cardStyle} shadow-lg aspect-square bg-gradient-to-bl outline-offset-4 focus:outline outline-blue-500 {gradientOf[
		card.c
	]}"
	class:md:-mt-32={stacked && !small}
	class:-mt-16={stacked}
	class:cursor-default={stacked}
	class:hover:scale-110={!stacked}
	class:hover:z-10={!stacked}
	disabled={stacked}
	data-card-id={card.id}
	on:click
	on:keypress
>
	<div class="px-1 text-3xl rounded-t-lg text-left {pointStyle} {bgColorOf[card.c]}">
		<span class:opacity-60={card.p === 0}>{card.p}</span>
	</div>
	<div
		class="text-sm pl-1 pb-1 grid w-12 gap-1 leading-none {costStyle} {cols[filteredLength - 1]}"
	>
		{#each card.cost as co, i}
			{#if filteredLength === 3 && secondPos === i}
				<div class:md:hidden={!small} />
			{/if}
			{#if !hideCost && co}
				<span
					class="p-0.5 w-5 flex justify-center items-center rounded-full aspect-square {bgColorOf[
						i
					]}"
					class:md:p-1={!small}
					class:md:w-8={!small}
				>
					{co}
				</span>
			{/if}
		{/each}
	</div>
</button>
