<script lang="ts">
	import { authed, user, userNames } from '$lib/main';
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
	import Hand from '$lib/compose/Hand.svelte';
	import { range } from '../../../../common/utils';
	import { moveTo } from '$lib/move';

	let cardCenter = { value: undefined as unknown as HTMLDivElement };
	let coinCenter = { value: undefined as unknown as HTMLDivElement };
	let target: HTMLElement | undefined = undefined;
	let reserved = false;

	function setCurrent(newVal: HTMLElement | undefined) {
		if (target) {
			target.setAttribute('style', '');
		}
		target = newVal;
	}

	function handleClick(
		setter: (target: HTMLElement | undefined) => void,
		center: { value?: HTMLDivElement },
		isReserved: boolean,
		e: MouseEvent | KeyboardEvent
	) {
		if ('key' in e && !['Space', 'Enter'].includes(e.key)) {
			return;
		}
		reserved = isReserved;
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

	const handleBuyCard = handleClick.bind({}, setCurrent, cardCenter, false);
	const handleReserveCard = handleClick.bind({}, setCurrent, cardCenter, true);
	const handleCoin = handleClick.bind({}, setCurrent, coinCenter, false);

	const searchId = readable(new URLSearchParams(globalThis.location?.search).get('id'));

	const game = createQuery({
		queryKey: ['game', $searchId],
		async queryFn() {
			if ($searchId == null) throw { message: 'ID undefined' };
			const params = { id: $searchId };
			const result = await authed({
				route: '/game',
				method: 'GET',
				params,
			});
			for (const { userName, userId } of result.data.players) {
				$userNames[userId] = userName;
			}
			return result;
		},
	});
</script>

<svelte:head>
	<title>Game</title>
</svelte:head>

<div class="flex flex-col lg:flex-row">
	<div class="flex flex-col md:flex-row">
		<div class="space-y-3">
			<div class="flex justify-center gap-2 md:gap-3">
				{#each $game.data?.data.shown.persons ?? [] as cardId}
					<Person card={cardFromId(cardId)} on:click={handleBuyCard} on:keypress={handleBuyCard} />
				{/each}
				<div class="h-14 md:h-32"></div>
			</div>
			<div class="flex gap-2 md:gap-3">
				<CardStack count={$game.data?.data.piles.high?.length} tier="high" />
				{#each $game.data?.data.shown.high ?? [] as cardId}
					<Card card={cardFromId(cardId)} on:click={handleBuyCard} on:keypress={handleBuyCard} />
				{/each}
			</div>
			<div class="flex gap-2 md:gap-3">
				<CardStack count={$game.data?.data.piles.middle?.length} tier="middle" />
				{#each $game.data?.data.shown.middle ?? [] as cardId}
					<Card card={cardFromId(cardId)} on:click={handleBuyCard} on:keypress={handleBuyCard} />
				{/each}
			</div>
			<div class="flex gap-2 md:gap-3">
				<CardStack count={$game.data?.data.piles.low?.length} tier="low" />
				{#each $game.data?.data.shown.low ?? [] as cardId}
					<Card card={cardFromId(cardId)} on:click={handleBuyCard} on:keypress={handleBuyCard} />
				{/each}
			</div>
		</div>
		<div class="flex gap-3 py-6 pl-2 md:flex-col md:pt-12 md:pl-4 md:gap-6">
			{#each $game.data?.data.tokens ?? [] as stackSize, color}
				<Coin {color} {stackSize} on:click={handleCoin} on:keypress={handleCoin} />
			{/each}
		</div>
	</div>
	<div class="grid w-full gap-4 md:pl-4 md:grid-cols-2">
		{#each $game.data?.data.players ?? [] as player}
			<Hand
				{player}
				turn={$game.data?.data.turn}
				buyReserved={handleReserveCard}
				targetCardId={Number(target?.dataset.cardId)}
			/>
		{/each}
		{#each range(4 - ($game.data?.data.players.length ?? 0)) as _}
			<div class=""></div>
		{/each}
	</div>
</div>
<details class="absolute w-64 rounded-md md:w-auto top-4 left-4 open:bg-white">
	<summary class="block cursor-pointer">
		<!-- prettier-ignore -->
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
			<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
		</svg>
	</summary>

	<div class="relative">
		{#if $searchId != null}<Actions gameId={$searchId} />{/if}
	</div>
</details>

<BuyModal
	closeModal={() => setCurrent(undefined)}
	open={target != null && !target.dataset.coinColor}
	game={$game.data?.data}
	cardId={target?.dataset.cardId ? Number(target.dataset.cardId) : undefined}
	player={$game.data?.data.players.find(({ userId }) => userId === $user?.id)}
	bind:center={cardCenter.value}
	{reserved}
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
