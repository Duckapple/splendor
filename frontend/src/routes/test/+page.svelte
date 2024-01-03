<script lang="ts">
	import { cards } from '../../../../common/defaults';
	import type { Card as CardType } from '../../../../common/model';
	import Person from './Person.svelte';
	import Card from './Card.svelte';
	import { writable } from 'svelte/store';
	import BuyModal from '$lib/BuyModal.svelte';
	const piles = ['high', 'middle', 'low'] as const;
	let current: HTMLElement | undefined = undefined;
	function setCurrent(newVal: HTMLElement | undefined) {
		if (current) {
			current.setAttribute('style', '');
		}
		current = newVal;
	}
	function handleClick(e: MouseEvent | KeyboardEvent) {
		const target = e.currentTarget;
		if (target instanceof HTMLElement) {
			if (current === target) {
				setCurrent(undefined);
				return;
			}
			setCurrent(target);
			const w2 = window.innerWidth / 2;
			const h2 = window.innerHeight / 2;
			const { left, top } = target.getBoundingClientRect();

			target.setAttribute(
				'style',
				`transform: rotate(0) translate(${w2 - left - target.clientWidth / 2}px, ${
					h2 - top - target.clientHeight / 2
				}px) scale(2); z-index: 30`
			);
		}
	}
</script>

<div class="flex flex-wrap gap-2 md:gap-4">
	{#each cards.persons as card}
		<Person {card} on:click={handleClick} on:keypress={handleClick} />
	{/each}
	{#each piles as pile}
		{#each cards[pile] as card}
			<Card {card} on:click={handleClick} on:keypress={handleClick} />
		{/each}
	{/each}
</div>

<BuyModal closeModal={() => setCurrent(undefined)} open={current != null} />

<!-- svelte-ignore a11y-no-noninteractive-element-interactions a11y-click-events-have-key-events -->
<!-- <dialog
	open={$current != null}
	on:click|self={() => setCurrent(undefined)}
	class="z-20 bg-white cursor-default backdrop:bg-black backdrop:bg-opacity-50 rounded-xl"
> -->
<!-- svelte-ignore a11y-no-static-element-interactions a11y-click-events-have-key-events -->
<!-- <div on:click|stopPropagation>
		<div class="w-96 h-96" />
		<div class="flex w-full pt-12">
			<button
				type="button"
				on:click={() => setCurrent(undefined)}
				on:keypress={() => setCurrent(undefined)}
			>
				Cancel
			</button>
			<button type="button">Buy</button>
		</div>
	</div>
</dialog> -->
<!-- <button
	class="fixed top-0 bottom-0 left-0 right-0 z-10 flex items-center justify-center w-full h-full translate-x-0 bg-gray-700 bg-opacity-50"
	class:bg-opacity-0={$current == null}
	class:translate-x-full={$current == null}
	on:click={() => setCurrent(undefined)}
>

</button> -->
