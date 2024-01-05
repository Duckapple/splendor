<script lang="ts">
	import type { Card } from '../../../../common/model';
	import { bgColorOf, gradientOf } from '$lib/color';

	export let stacked = false;
	export let card: Card;
	export let hideCost = false;

	const { c, cost, id, p } = card;
	const filteredLength = cost.filter(Boolean).length;
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

<button
	class={'flex flex-col justify-between w-16 h-24 transition-transform border border-black rounded-lg select-none md:w-32 md:h-48 md:text-3xl shadow-lg aspect-square bg-gradient-to-br ' +
		gradientOf[c]}
	class:md:-mt-32={stacked}
	class:-mt-16={stacked}
	class:hover:scale-110={!stacked}
	class:hover:z-10={!stacked}
	data-card-id={id}
	on:click
	on:keypress
>
	<div class={'py-0.5 px-2 text-3xl md:text-6xl rounded-t-lg text-left ' + bgColorOf[c]}>
		<span class={p ? '' : 'opacity-20'}>{p ?? '0'}</span>
	</div>
	<div
		class={'text-sm md:text-3xl md:leading-5 pl-1 md:pl-2 pb-1 md:pb-2 grid w-12 md:w-20 gap-1 leading-none md:gap-2' +
			cols[filteredLength - 1]}
	>
		{#each cost as co, i}
			{#if filteredLength === 3 && secondPos === i}
				<div class="md:hidden" />
			{/if}
			{#if !hideCost && co}
				<span
					class={'p-0.5 md:p-1 w-5 md:w-8 text-center border border-black rounded-full aspect-square outline outline-white outline-2 md:outline-[3px] ' +
						bgColorOf[i]}
				>
					{co}
				</span>
			{/if}
		{/each}
	</div>
</button>
