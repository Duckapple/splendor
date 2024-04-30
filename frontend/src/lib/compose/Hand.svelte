<script lang="ts">
	import type { Card as CardType } from '../../../../common/model';
	import Card from '$lib/game/Card.svelte';
	import Coin from '$lib/game/Coin.svelte';
	import { user } from '$lib/main';
	import { cardFromId } from '../../../../common/defaults';
	import type { SplendorGamePlayer } from '../../../../db/schema';

	export let player: SplendorGamePlayer & { userName: string };
	export let turn: number | undefined;

	const isUser = $user?.id === player.userId;

	$: currentPlayer = isUser ? " - It's your turn!" : ' - Current player';

	$: sorted = (() => {
		const sorted: CardType[][] = [[], [], [], [], [], []];
		for (const cardId of player.cards) {
			const card = cardFromId(cardId);
			sorted[card.c].push(card);
		}
		return sorted;
	})();
	$: shownCards = sorted.slice(0, 5);
</script>

<div class="p-2 space-y-1 border rounded">
	<h1 title="User ID: {player.userId}">
		'<span class:underline={isUser}>{player.userName}</span>'{turn === player.position
			? currentPlayer
			: ''}
	</h1>
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
		<div class="absolute space-y-2 origin-top-right -rotate-90 -left-14">
			{#each player.reserved as cardId}
				<Card card={cardFromId(cardId)} small />
			{/each}
		</div>
	</div>
</div>
