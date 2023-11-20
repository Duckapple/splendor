<script lang="ts">
	import type { cards } from '../../../../common/defaults';
	import { colorOf } from '$lib/color';
	export let card: (typeof cards.persons)[number];
	const { cost, id, p } = card;
	const persons = ['👨🏼‍🌾', '👩🏽‍🔧', '👩🏿‍💻', '🧑🏻‍💼', '👨🏽‍🎨', '👩🏿‍🚒', '🕵🏼', '👸🏾', '🤵🏻‍♂️', '🧙🏽‍♂️'];
</script>

<div
	class="relative w-16 h-16 border border-black rounded-lg select-none md:w-32 md:h-32 md:text-4xl aspect-square bg-gradient-to-br from-slate-50 to-slate-200"
>
	<span class="absolute text-3xl md:text-6xl left-1.5 top-0 md:left-2 md:top-2">{p}</span>
	<div
		class="absolute flex gap-0.5 md:gap-1 leading-none md:leading-7 left-1 md:left-2 bottom-1 md:bottom-2"
	>
		{#each cost as co, i}
			{#if co}
				<span
					class={'p-0.5 md:p-1 text-center border border-black rounded-sm md:rounded ' + colorOf[i]}
				>
					{co}
				</span>
			{/if}
		{/each}
	</div>
	<span class="absolute right-0.5 text-2xl top-1 md:text-6xl md:right-2 md:top-2">
		{persons[id - 0xc0] ?? ''}
	</span>
</div>
