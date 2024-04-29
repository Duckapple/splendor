<script lang="ts">
	import { authed, user } from '$lib/main';
	import { readable } from 'svelte/store';
	import { createQuery } from '@tanstack/svelte-query';

	import BuyModal from '$lib/compose/BuyModal.svelte';
	import TakeModal from '$lib/compose/TakeModal.svelte';
	import Card from '$lib/game/Card.svelte';
	import CardStack from '$lib/game/CardStack.svelte';
	import Coin from '$lib/game/Coin.svelte';
	import Person from '$lib/game/Person.svelte';

	import Actions from './Actions.svelte';
	import { cardFromId } from '../../../../common/defaults';

	let cardCenter = { value: undefined as unknown as HTMLDivElement };
	let coinCenter = { value: undefined as unknown as HTMLDivElement };
	let target: HTMLElement | undefined = undefined;

	function setCurrent(newVal: HTMLElement | undefined) {
		if (target) {
			target.setAttribute('style', '');
		}
		target = newVal;
	}

	function moveTo(target: HTMLElement, transform: HTMLElement | Record<'x' | 'y', number>) {
		requestAnimationFrame(() => {
			const { left, top } = target.getBoundingClientRect();
			const { x, y } =
				transform instanceof HTMLElement ? transform.getBoundingClientRect() : transform;

			const scale = target.dataset.coinColor ? 1 : 2;
			const opacity = target.dataset.coinColor ? 0 : 1;
			const zIndex = target.dataset.coinColor ? '' : 'z-index: 30;';

			target.setAttribute(
				'style',
				`transform: rotate(0) translate(${x - left - target.clientWidth / 2}px, ${
					y - top - target.clientHeight / 2
				}px) scale(${scale}); ${zIndex} opacity: ${opacity}`
			);

			if (target.dataset.coinColor) {
				target.classList.add('z-30');
				setTimeout(() => {
					target.classList.remove('z-30');
				}, 200);
			}
		});
	}

	function handleClick(
		setter: (target: HTMLElement | undefined) => void,
		center: { value?: HTMLDivElement },
		e: MouseEvent | KeyboardEvent
	) {
		if ('key' in e && !['Space', 'Enter'].includes(e.key)) {
			return;
		}
		const newTarget = e.currentTarget;
		if (newTarget instanceof HTMLElement) {
			if (target === newTarget) {
				setter(undefined);
				return;
			}
			setter(newTarget);
			center.value && moveTo(newTarget, center.value);
		}
	}

	const handleCard = handleClick.bind({}, setCurrent, cardCenter);
	const handleCoin = handleClick.bind({}, setCurrent, coinCenter);

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
	<div class="space-y-3">
		<div class="flex justify-center gap-2 md:gap-3">
			{#each $game.data?.data.shown.persons ?? [] as cardId}
				<Person card={cardFromId(cardId)} on:click={handleCard} on:keypress={handleCard} />
			{/each}
		</div>
		<div class="flex gap-2 md:gap-3">
			<CardStack count={$game.data?.data.piles.high?.length} tier="high" />
			{#each $game.data?.data.shown.high ?? [] as cardId}
				<Card card={cardFromId(cardId)} on:click={handleCard} on:keypress={handleCard} />
			{/each}
		</div>
		<div class="flex gap-2 md:gap-3">
			<CardStack count={$game.data?.data.piles.middle?.length} tier="middle" />
			{#each $game.data?.data.shown.middle ?? [] as cardId}
				<Card card={cardFromId(cardId)} on:click={handleCard} on:keypress={handleCard} />
			{/each}
		</div>
		<div class="flex gap-2 md:gap-3">
			<CardStack count={$game.data?.data.piles.low?.length} tier="low" />
			{#each $game.data?.data.shown.low ?? [] as cardId}
				<Card card={cardFromId(cardId)} on:click={handleCard} on:keypress={handleCard} />
			{/each}
		</div>
	</div>
	<div class="flex flex-col gap-5 pt-6 pl-2 md:pt-12 md:pl-4 md:gap-6">
		{#each $game.data?.data.tokens ?? [] as stackSize, color}
			<Coin {color} {stackSize} on:click={handleCoin} />
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
	open={target != null && !target.dataset.coinColor}
	game={$game.data?.data}
	cardId={target?.dataset.cardId ? Number(target.dataset.cardId) : undefined}
	player={$game.data?.data.players.find(({ userId }) => userId === $user?.id)}
	bind:center={cardCenter.value}
/>

<TakeModal
	closeModal={() => setCurrent(undefined)}
	open={target != null && !!target.dataset.coinColor}
	game={$game.data?.data}
	targetCoin={target}
	initialCoinColor={target == null ? null : Number(target.dataset.coinColor)}
	player={$game.data?.data.players.find(({ userId }) => userId === $user?.id)}
	bind:center={coinCenter.value}
/>
