<script lang="ts">
	import { authed } from '$lib/main';
	import { readable } from 'svelte/store';
	import { createQuery } from '@tanstack/svelte-query';

	import Actions from './Actions.svelte';
	import Card from './Card.svelte';
	import { cardFromId } from '../../../../common/defaults';
	import Person from './Person.svelte';
	import BuyModal from '$lib/BuyModal.svelte';
	import Coin from './Coin.svelte';
	import CardStack from './CardStack.svelte';

	let center: HTMLDivElement;
	let target: HTMLElement | undefined = undefined;

	function setCurrent(newVal: HTMLElement | undefined) {
		if (target) {
			target.setAttribute('style', '');
		}
		target = newVal;
	}
	function moveTo(target: HTMLElement, position: HTMLElement | Record<'x' | 'y', number>) {
		requestAnimationFrame(() => {
			const { left, top } = target.getBoundingClientRect();
			const { x, y } =
				position instanceof HTMLElement ? position.getBoundingClientRect() : position;

			target.setAttribute(
				'style',
				`transform: rotate(0) translate(${x - left - target.clientWidth / 2}px, ${
					y - top - target.clientHeight / 2
				}px) scale(2); z-index: 30`
			);
		});
	}
	function handleClick(e: MouseEvent | KeyboardEvent) {
		if ('key' in e && !['Space', 'Enter'].includes(e.key)) {
			return;
		}
		const newTarget = e.currentTarget;
		if (newTarget instanceof HTMLElement) {
			if (target === newTarget) {
				setCurrent(undefined);
				return;
			}
			setCurrent(newTarget);
			moveTo(newTarget, center);
		}
	}

	const searchId = readable(new URLSearchParams(globalThis.location?.search).get('id'));

	const game = createQuery({
		queryKey: ['game', $searchId],
		queryFn() {
			if ($searchId == null) throw { message: 'ID undefined' };
			const params = { id: $searchId };
			return authed({
				route: '/game',
				method: 'GET',
				params,
			});
		},
	});
</script>

<svelte:head>
	<title>Game</title>
</svelte:head>

<div class="flex">
	<div class="space-y-4">
		<div class="flex justify-center gap-2 md:gap-4">
			{#each $game.data?.data.shown.persons ?? [] as cardId}
				<Person card={cardFromId(cardId)} on:click={handleClick} on:keypress={handleClick} />
			{/each}
		</div>
		<div class="flex gap-2 md:gap-4">
			<CardStack count={$game.data?.data.piles.high?.length} tier="high" />
			{#each $game.data?.data.shown.high ?? [] as cardId}
				<Card card={cardFromId(cardId)} on:click={handleClick} on:keypress={handleClick} />
			{/each}
		</div>
		<div class="flex gap-2 md:gap-4">
			<CardStack count={$game.data?.data.piles.middle?.length} tier="middle" />
			{#each $game.data?.data.shown.middle ?? [] as cardId}
				<Card card={cardFromId(cardId)} on:click={handleClick} on:keypress={handleClick} />
			{/each}
		</div>
		<div class="flex gap-2 md:gap-4">
			<CardStack count={$game.data?.data.piles.low?.length} tier="low" />
			{#each $game.data?.data.shown.low ?? [] as cardId}
				<Card card={cardFromId(cardId)} on:click={handleClick} on:keypress={handleClick} />
			{/each}
		</div>
	</div>
	<div class="flex flex-col gap-5 pt-6 pl-2 md:pt-12 md:pl-4 md:gap-6">
		{#each $game.data?.data.tokens ?? [] as stackSize, color}
			<Coin {color} {stackSize} on:click={() => console.log(color)} />
		{/each}
	</div>
</div>
<details class="mt-8 mb-12 md:mt-10">
	<summary>JSON dump</summary>

	{JSON.stringify($game.error)}

	{#if $searchId != null}<Actions gameId={$searchId} />{/if}
	<pre>{JSON.stringify($game.data, null, 2)}</pre>
</details>

<BuyModal
	closeModal={() => setCurrent(undefined)}
	open={target != null}
	cardId={target?.dataset.cardId ? Number(target?.dataset.cardId) : undefined}
	player={{ cards: [0, 1, 2, 3], reserved: [], tokens: [2, 0, 0, 0, 0, 1] }}
	bind:center
/>
