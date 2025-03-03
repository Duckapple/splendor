<script lang="ts">
	import { type Card } from '$common/model';
	import { bgColorOf, fadeTextBgColorOf, gradientOf, iconOf } from '$lib/color';
	import type { KeyboardEventHandler, MouseEventHandler } from 'svelte/elements';
	import Icon from '$lib/base/Icon.svelte';
	import { getContext, onMount } from 'svelte';
	import { useRuneContext } from '$lib/state/context-rune.svelte';

	interface Props {
		stacked?: boolean;
		card: Card;
		hideCost?: boolean;
		small?: boolean;
		rotated?: boolean;
		onclick?: MouseEventHandler<HTMLButtonElement> | null;
		onkeypress?: KeyboardEventHandler<HTMLButtonElement> | null;
		style?: string;
		autofocus?: boolean;
	}

	let {
		stacked = false,
		card,
		hideCost = false,
		small = false,
		rotated = false,
		onclick,
		onkeypress,
		style,
		autofocus,
	}: Props = $props();

	const colorBlind = useRuneContext('colorblind');

	let filteredLength = $derived(card.cost.filter(Boolean).length);
	const cols = [
		' grid-cols-1',
		' grid-cols-1',
		' grid-cols-2' + (!small ? ' md:grid-cols-1' : ''),
		' grid-cols-2',
	];
	let secondPos = $derived(
		(() => {
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
		})()
	);
	let cardStyle = $derived(!small ? 'md:w-32 md:h-48 md:text-3xl' : '');
	let pointStyle = $derived(!small ? 'md:py-0.5 md:px-2 md:text-6xl' : '');
	let costStyle = $derived(!small ? 'md:text-2xl md:leading-5 md:pl-2 md:pb-2 md:w-20' : '');

	let fadeText = $derived(card.p === 0);

	let ref = $state<HTMLButtonElement>();
	onMount(() => {
		if (autofocus) {
			ref?.focus();
		}
	});
</script>

<button
	bind:this={ref}
	class="flex flex-col justify-between w-14 h-[5.5rem] first:mt-0 transition-[transform,opacity] rounded-lg border border-black select-none {cardStyle} shadow-lg aspect-square bg-gradient-to-bl outline-offset-4 focus:outline outline-blue-500 {gradientOf[
		card.c
	]}"
	class:md:-mt-32={stacked && !small}
	class:-mt-16={stacked}
	class:cursor-default={stacked}
	class:hover:scale-110={!stacked}
	class:hover:z-10={!stacked}
	class:-rotate-90={rotated}
	disabled={stacked}
	data-card-id={card.id}
	{onclick}
	{onkeypress}
	{style}
>
	<div
		class="px-1 text-3xl rounded-t-lg text-left w-full flex items-center justify-between {pointStyle} {fadeText
			? fadeTextBgColorOf[card.c]
			: bgColorOf[card.c]}"
	>
		<span>{card.p}</span>
		<Icon
			icon={iconOf[card.c]}
			class="{bgColorOf[card.c]} {small ? 'size-6' : 'size-6 md:size-10'} rotate-12"
		/>
	</div>
	<div
		class={[
			'text-sm pl-1 pb-1 grid w-12 gap-1 leading-none',
			costStyle,
			cols[filteredLength - 1],
			colorBlind.value && 'md:gap-y-2 md:gap-x-6',
		]}
	>
		{#each card.cost as co, i}
			{#if filteredLength === 3 && secondPos === i}
				<div class:md:hidden={!small}></div>
			{/if}
			{#if !hideCost && co}
				{@const bg = bgColorOf[i]}
				<span
					class={[
						'relative z-0 p-0.5 w-5 flex justify-center items-center rounded-full aspect-square',
						bg,
						!small && 'md:w-8 md:p-1',
					]}
				>
					{co}
					{#if colorBlind.value}
						<div
							class={[
								'absolute -z-10 -right-1 top-0 flex justify-end items-center w-5 rounded-full',
								bg,
								!small && 'md:w-10 md:pr-px md:h-6 md:-right-3',
							]}
						>
							<Icon icon={iconOf[i]} class={['size-3 rotate-12', !small && 'md:size-5']} />
						</div>
					{/if}
				</span>
			{/if}
		{/each}
	</div>
</button>
