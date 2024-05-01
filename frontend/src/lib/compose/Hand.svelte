<script lang="ts">
	import { Color, type Card as CardType } from '../../../../common/model';
	import Card from '$lib/game/Card.svelte';
	import Coin from '$lib/game/Coin.svelte';
	import { user } from '$lib/main';
	import { cardFromId } from '../../../../common/defaults';
	import type { SplendorGamePlayer } from '../../../../db/schema';
	import Person from '$lib/game/Person.svelte';

	export let player: SplendorGamePlayer & { userName: string };
	export let turn: number | undefined;
	export let buyReserved: (e: MouseEvent | KeyboardEvent) => void;
	export let targetCardId: number;

	$: isUser = $user?.id === player.userId;

	$: currentPlayer = isUser ? " - It's your turn!" : ' - Current player';
	$: handleBuyReserved = isUser ? buyReserved : () => {};

	$: sorted = (() => {
		const sorted: CardType[][] = [[], [], [], [], [], []];
		for (const cardId of player.cards) {
			const card = cardFromId(cardId);
			sorted[card.c].push(card);
		}
		return sorted;
	})();
	$: shownCards = sorted.slice(0, 5);
	$: persons = sorted[Color.Y];
</script>

<div class="p-2 space-y-1 border rounded">
	<h1 title="User ID: {player.userId}">
		'<span class:underline={isUser}>{player.userName}</span>'{turn === player.position
			? currentPlayer
			: ''}
	</h1>
	{#if persons.length}
		<h2 class="text-sm">Nobles</h2>
		{#each persons as person}
			<Person card={person} small />
		{/each}
	{/if}
	<h2 class="text-sm">Cards</h2>
	{#if player.cards.length === 0}
		<div
			class="flex items-center justify-center text-gray-500 border-2 border-gray-400 border-dashed rounded-md min-h-24"
		>
			No cards
		</div>
	{/if}
	<div class="flex gap-2">
		{#each shownCards as cardStack}
			{#if cardStack.length > 0}
				<div class="flex flex-col">
					{#each cardStack as card}
						<Card {card} hideCost stacked small />
					{/each}
				</div>
			{/if}
		{/each}
	</div>
	<h2 class="text-sm">Coins</h2>
	<div class="flex gap-2 min-h-12">
		{#each player.tokens as stackSize, color}
			<Coin small {stackSize} {color} />
		{/each}
	</div>
	<h2 class="text-sm">Reserved</h2>
	{#if player.reserved.length === 0}
		<div
			class="flex items-center justify-center text-gray-500 border-2 border-gray-400 border-dashed rounded-md min-h-14"
		>
			No reserved cards
		</div>
	{/if}
	<div class="relative" class:min-h-14={player.reserved.length !== 0}>
		<div class="flex pl-4 -mt-4 space-x-10">
			{#each player.reserved as cardId}
				<Card
					card={cardFromId(cardId)}
					small={cardId !== targetCardId}
					rotated
					on:click={(e) => handleBuyReserved(e)}
					on:keypress={(e) => handleBuyReserved(e)}
				/>
			{/each}
		</div>
	</div>
</div>
