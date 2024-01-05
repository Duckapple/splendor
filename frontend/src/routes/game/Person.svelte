<script lang="ts">
	import type { Card } from '../../../../common/model';
	import { bgColorOf } from '$lib/color';
	export let card: Card;
	const { cost, id, p } = card;
	const persons = ['👨🏼‍🌾', '👩🏽‍🔧', '👩🏿‍💻', '🧑🏻‍💼', '👨🏽‍🎨', '👩🏿‍🚒', '🕵🏼', '👸🏾', '🤵🏻‍♂️', '🧙🏽‍♂️'];
</script>

<button
	class="relative transition-transform border border-black rounded-lg select-none w-14 h-14 md:w-32 md:h-32 md:text-4xl aspect-square bg-gradient-to-br from-slate-50 to-slate-200"
	data-card-id={id}
	on:click
	on:keypress
>
	<span class="absolute text-3xl md:text-6xl left-1.5 top-0 md:left-2 md:top-1">{p}</span>
	<div
		class="absolute flex gap-0.5 md:gap-1 leading-none md:leading-7 left-1 md:left-2 bottom-1 md:bottom-2"
	>
		{#each cost as co, i}
			{#if co}
				<span
					class={'px-0.5 md:p-1 text-center border border-black rounded-sm md:rounded ' +
						bgColorOf[i]}
				>
					{co}
				</span>
			{/if}
		{/each}
	</div>
	<span class="absolute top-0 right-0 text-2xl md:text-6xl md:right-2 md:top-2">
		{persons[id - 0xc0] ?? ''}
	</span>
</button>
