<script lang="ts">
	import { client, jwt, user, userNames } from '$lib/main';
	import { readable } from 'svelte/store';
	import { fade } from 'svelte/transition';
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

	import { cardFromId } from '$common/defaults';
	import Hand from '$lib/compose/Hand.svelte';
	import { range } from '$common/utils';
	import { moveTo } from '$lib/move';
	import type { GameAndPlayers } from '$common/communication';
	import { useUpdateGameState } from '$lib/state/update-game';
	import Icon from '$lib/base/Icon.svelte';
	import { GamePhase } from '$common/model';
	import { tick } from 'svelte';
	import Button from '$lib/base/Button.svelte';
	import ColorblindToggle from './ColorblindToggle.svelte';
	import { getWebSocket } from '$lib/web-socket.svelte';
	import { gameQuery } from './_queries';

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

	const ws = getWebSocket();
	let subbed = $state(false);
	$effect(() => {
		if (jwt && ws && !subbed) {
			ws?.subscribe(({ data }) => {
				switch (data.type) {
					case 'game-update':
						console.log('Your turn!', data);
						updateGameState(data.id, { data: data.update, error: null, status: 200 });
						break;
				}
			});
			subbed = true;
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

	const game = $derived(createQuery(gameQuery(fetch, $searchId)));

	$effect(() => {
		for (const { userName, userId } of $game.data?.data?.players ?? []) {
			$userNames[userId] = userName;
		}
	});

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

	const playersWithPoints = $derived.by(() => {
		if (gameCache?.phase === GamePhase.FINISHED) {
			return (gameCache?.players ?? [])
				.map((player) => ({
					...player,
					points: player.cards.reduce((acc, card) => acc + cardFromId(card).p, 0),
				}))
				.sort((a, b) => b.points - a.points);
		}
		return gameCache?.players;
	});

	let hideOverlay = $state(false);
	let showWinners = $state(false);
	$effect(() => {
		if (gameCache?.phase === GamePhase.FINISHED) {
			tick().then(() => {
				showWinners = true;
			});
		}
	});
</script>

<svelte:head>
	<title>Game</title>
</svelte:head>

<div class="flex flex-col gap-4 p-2 lg:flex-row md:p-4">
	<div class="flex flex-col md:flex-row">
		<div class="space-y-3">
			<div class="flex justify-center gap-2 md:gap-3">
				{#each gameCache?.shown?.persons ?? [] as cardId (cardId)}
					<Person card={cardFromId(cardId)} onclick={handleBuyCard} onkeypress={handleBuyCard} />
				{/each}
				<div class="h-14 md:h-32"></div>
			</div>
			<div class="flex gap-2 md:gap-3">
				<CardStack count={gameCache?.piles?.high?.length} tier="high" />
				{#each gameCache?.shown?.high ?? [] as cardId (cardId)}
					<Card card={cardFromId(cardId)} onclick={handleBuyCard} onkeypress={handleBuyCard} />
				{/each}
			</div>
			<div class="flex gap-2 md:gap-3">
				<CardStack count={gameCache?.piles?.middle?.length} tier="middle" />
				{#each gameCache?.shown?.middle ?? [] as cardId (cardId)}
					<Card card={cardFromId(cardId)} onclick={handleBuyCard} onkeypress={handleBuyCard} />
				{/each}
			</div>
			<div class="flex gap-2 md:gap-3">
				<CardStack count={gameCache?.piles?.low?.length} tier="low" />
				{#each gameCache?.shown?.low ?? [] as cardId (cardId)}
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
	<div class="flex flex-wrap w-full gap-4">
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
<div class="absolute left-4 top-4 flex gap-2">
	<!-- <details class="rounded-md md:w-auto open:bg-white">
		<summary class="block cursor-pointer"> -->
	<!-- prettier-ignore -->
	<!-- <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
				<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
			</svg>
		</summary>

		<div class="relative">
			{#if $searchId != null}<Actions gameId={$searchId} />{/if}
		</div>
	</details> -->
	<button onclick={() => $notify.mutate()}>
		<Icon icon="bell" class="size-6 md:size-8 [stroke-width:1.5]" />
	</button>
	<ColorblindToggle />
	{#if gameCache?.phase === GamePhase.FINISHED}
		<button onclick={() => (hideOverlay = !hideOverlay)}>
			<Icon icon="trophy" class="size-8 [stroke-width:1.5] {hideOverlay ? 'animate-bounce' : ''}" />
		</button>
	{/if}
</div>

{#if gameCache?.phase === GamePhase.FINISHED && !hideOverlay}
	<div
		transition:fade={{ duration: 500 }}
		class="fixed inset-0 flex items-center justify-center bg-slate-950 bg-opacity-75 z-10 select-none"
	>
		<div class="text-white flex flex-col items-center gap-y-6 mb-64 sm:mb-0">
			<h2 class="text-4xl text-center">Game Over</h2>
			<div class="flex flex-col gap-y-4 gap-x-8 lg:grid grid-cols-2 text-center lg:text-left">
				{#each playersWithPoints ?? [] as player, i}
					{@const delayIndex = (playersWithPoints?.length ?? 0) - i}
					{#if showWinners}
						<div
							class="flex flex-col justify-center items-center {i === 0
								? 'lg:items-end row-span-3'
								: 'lg:items-start'} gap-1"
							transition:fade={{ duration: 500, delay: 1000 + delayIndex * 2000 }}
						>
							<span class={i === 0 ? 'text-6xl lg:text-7xl' : i === 1 ? 'text-4xl' : 'text-xl'}>
								{$userNames[player.userId]}
							</span>
							<span>{player.cards.reduce((acc, card) => acc + cardFromId(card).p, 0)} points</span>
						</div>
					{/if}
				{/each}
			</div>
			{#if showWinners}
				<div
					class="flex gap-2"
					transition:fade={{ duration: 500, delay: 3000 + (playersWithPoints?.length ?? 0) * 2000 }}
				>
					<Button
						onClick={() => (hideOverlay = !hideOverlay)}
						class="bg-slate-800 border-slate-500"
					>
						Hide overlay
					</Button>
					<Button class="bg-slate-800 border-slate-500" href="/">Back to game list</Button>
				</div>
			{/if}
		</div>
	</div>
{/if}

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
