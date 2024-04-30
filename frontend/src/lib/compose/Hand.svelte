<script lang="ts">
	import Card from '$lib/game/Card.svelte';
	import Coin from '$lib/game/Coin.svelte';
	import { user } from '$lib/main';
	import { cardFromId } from '../../../../common/defaults';
	import type { SplendorGamePlayer } from '../../../../db/schema';

	export let player: SplendorGamePlayer & { userName: string };
	export let turn: number | undefined;

	const isUser = $user?.id === player.userId;
</script>

<div class="p-2 space-y-1 border rounded">
	<h1 title="User ID: {player.userId}">
		'<span class:underline={isUser}>{player.userName}</span>'{turn === player.position
			? ' - current player'
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
	<div>
		{#each player.cards as cardId}
			<Card card={cardFromId(cardId)} hideCost stacked small />
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
	<div class="rotate-90">
		{#each player.reserved as cardId}
			<Card card={cardFromId(cardId)} hideCost small />
		{/each}
	</div>
</div>
