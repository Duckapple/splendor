<script lang="ts">
	import type { Card } from '../../../../common/model';
	import { bgColorOf } from '$lib/color';
	import type { KeyboardEventHandler, MouseEventHandler } from 'svelte/elements';
	interface Props {
		card: Card;
		small?: boolean;
		onclick?: MouseEventHandler<HTMLButtonElement> | null;
		onkeypress?: KeyboardEventHandler<HTMLButtonElement> | null;
	}

	let { card, small = false, onclick, onkeypress }: Props = $props();
	const { cost, id, p } = card;
	const persons = ['👨🏼‍🌾', '👩🏽‍🔧', '👩🏿‍💻', '🧑🏻‍💼', '👨🏽‍🎨', '👩🏿‍🚒', '🕵🏼', '👸🏾', '🤵🏻‍♂️', '🧙🏽‍♂️'];

	let buttonMd = $derived(small ? '' : 'md:w-32 md:h-32 md:text-4xl');
	let pointsMd = $derived(small ? '' : 'md:text-6xl md:left-2 md:top-1');
	let costsMd = $derived(small ? '' : 'md:gap-1 md:leading-7 md:left-2 md:bottom-2');
	let costMd = $derived(small ? '' : 'md:p-1 md:rounded');
	let personMd = $derived(small ? '' : 'md:text-6xl md:right-2 md:top-2');
</script>

<button
	class="relative transition-transform border border-black rounded-lg select-none w-14 h-14 aspect-square bg-gradient-to-br from-slate-50 to-slate-200 hover:scale-110 {buttonMd}"
	data-card-id={id}
	{onclick}
	{onkeypress}
>
	<span class="absolute top-0 text-3xl leading-none left-1 {pointsMd}">{p}</span>
	<div class="absolute flex gap-0.5 leading-none left-1 bottom-1 {costsMd}">
		{#each cost as co, i}
			{#if co}
				<span class="p-[1pt] text-center border border-black rounded-sm {costMd} {bgColorOf[i]}">
					{co}
				</span>
			{/if}
		{/each}
	</div>
	<span class="absolute top-0 right-0 text-2xl {personMd}">
		{persons[id - 0xc0] ?? ''}
	</span>
</button>
