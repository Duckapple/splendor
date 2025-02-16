<script lang="ts">
	import { client, jwt, user, userNames } from '$lib/main';
	import { readable } from 'svelte/store';
	import {
		createMutation,
		createQuery,
		queryOptions,
		useQueryClient,
	} from '@tanstack/svelte-query';

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
	import type { GameAndPlayers } from '../../../../common/communication';
	import { useUpdateGameState } from '$lib/state/update-game';

	const qc = useQueryClient();
	const { updateGameState } = useUpdateGameState(qc);

	let cardCenter = $state({ value: undefined as unknown as HTMLDivElement });
	let coinCenter = $state({ value: undefined as unknown as HTMLDivElement });
	let target: HTMLElement | undefined = $state(undefined);
	let reserved = $state(false);

	const serviceWorker = new BroadcastChannel('service-worker');

	serviceWorker.addEventListener('message', (e) => {
		switch (e.data.type) {
			case 'notifications':
				console.log('Notification:', e.data);
				break;
			case 'your-turn':
				console.log('Your turn!', e.data);
				updateGameState(e.data.gameId, { data: e.data.data, error: null, status: 200 });
				break;
		}
	});

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

	// let gameCache = $state<GameAndPlayers>();

	const gameQueryOptions = $derived(
		queryOptions({
			queryKey: ['game', $searchId],
			async queryFn() {
				if ($searchId == null) throw { message: 'ID undefined' };
				const params = { id: $searchId };
				const result = await client.game(params).get();
				for (const { userName, userId } of result.data?.players ?? []) {
					$userNames[userId] = userName;
				}
				// gameCache = result.data;
				return result;
			},
		})
	);

	const game = $derived(createQuery(gameQueryOptions));

	const gameCache = $derived($game.data?.data as GameAndPlayers | undefined);

	const notify = createMutation({
		mutationKey: ['notifications', $user?.id],
		async mutationFn() {
			let allowed = window.Notification.permission;
			if (allowed === 'default') {
				allowed = await window.Notification.requestPermission();
				serviceWorker.postMessage({ type: 'notifications', jwt: $jwt });
			}
		},
	});
</script>

<svelte:head>
	<title>Game</title>
</svelte:head>

<div class="flex flex-col p-2 lg:flex-row md:p-4">
	<div class="flex flex-col md:flex-row">
		<div class="space-y-3">
			<div class="flex justify-center gap-2 md:gap-3">
				{#each gameCache?.shown?.persons ?? [] as cardId}
					<Person card={cardFromId(cardId)} onclick={handleBuyCard} onkeypress={handleBuyCard} />
				{/each}
				<div class="h-14 md:h-32"></div>
			</div>
			<div class="flex gap-2 md:gap-3">
				<CardStack count={gameCache?.piles?.high?.length} tier="high" />
				{#each gameCache?.shown?.high ?? [] as cardId}
					<Card card={cardFromId(cardId)} onclick={handleBuyCard} onkeypress={handleBuyCard} />
				{/each}
			</div>
			<div class="flex gap-2 md:gap-3">
				<CardStack count={gameCache?.piles?.middle?.length} tier="middle" />
				{#each gameCache?.shown?.middle ?? [] as cardId}
					<Card card={cardFromId(cardId)} onclick={handleBuyCard} onkeypress={handleBuyCard} />
				{/each}
			</div>
			<div class="flex gap-2 md:gap-3">
				<CardStack count={gameCache?.piles?.low?.length} tier="low" />
				{#each gameCache?.shown?.low ?? [] as cardId}
					<Card card={cardFromId(cardId)} onclick={handleBuyCard} onkeypress={handleBuyCard} />
				{/each}
			</div>
		</div>
		<div class="flex gap-3 py-6 pl-2 md:flex-col md:pt-12 md:pl-4 md:gap-6">
			{#each gameCache?.tokens ?? [] as stackSize, color}
				<Coin {color} {stackSize} onclick={handleCoin} onkeypress={handleCoin} />
			{/each}
		</div>
	</div>
	<div class="grid w-full gap-4 md:pl-4 md:grid-cols-2">
		{#each gameCache?.players ?? [] as player}
			<Hand
				{player}
				turn={gameCache?.turn}
				buyReserved={handleReserveCard}
				targetCardId={Number(target?.dataset.cardId)}
				phase={gameCache?.phase}
			/>
		{/each}
		{#each range(4 - (gameCache?.players.length ?? 0)) as _}
			<div class=""></div>
		{/each}
	</div>
</div>
<details class="absolute rounded-md md:w-auto top-4 left-4 open:bg-white">
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
<button class="absolute top-4 left-14" onclick={() => $notify.mutate()}>
	<!-- prettier-ignore -->
	<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
		<path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
	</svg>
</button>

<BuyModal
	closeModal={() => setCurrent(undefined)}
	open={target != null && !target.dataset.coinColor}
	game={gameCache}
	{target}
	cardId={target?.dataset.cardId ? Number(target.dataset.cardId) : undefined}
	player={gameCache?.players.find(({ userId }) => userId === $user?.id)}
	bind:center={cardCenter.value}
	{reserved}
/>

<TakeModal
	closeModal={() => setCurrent(undefined)}
	open={target != null && !!target.dataset.coinColor}
	game={gameCache}
	targetCoin={target}
	initialCoinColor={target == null ? null : Number(target.dataset.coinColor)}
	player={gameCache?.players.find(({ userId }) => userId === $user?.id)}
	bind:center={coinCenter.value}
/>
