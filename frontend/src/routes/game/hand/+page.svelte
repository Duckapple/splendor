<script lang="ts">
	import type { Card as CardType } from '../../../../../common/model';
	import { cardFromId, cards } from '../../../../../common/defaults';
	import Card from '../Card.svelte';
	import Coin from '../Coin.svelte';
	const handCards = [0x08, 0x19, 0xc2, 0x4a, 0x42, 0x09, 0x4e, 0x24, 0x90, 0x91];
	$: tokens = [1, 0, 3, 2, 1, 1];
	const sorted: CardType[][] = [[], [], [], [], [], []];
	for (const cardId of handCards) {
		const card = cardFromId(cardId);
		sorted[card.c].push(card);
	}
	const shownCards = sorted.slice(0, 5);
</script>

<div class="flex justify-center gap-2 px-2 pt-2 border border-black md:pt-4 md:px-4">
	{#each shownCards as stack, i}
		<div class="flex flex-col justify-end">
			{#each stack as card}
				<Card {card} stacked hideCost />
			{/each}
			<div class="h-16 p-3 -mt-12 md:h-32 md:-mt-24 md:p-4">
				{#if tokens[i] > 0}
					<Coin stackSize={tokens[i]} color={i} />
				{/if}
			</div>
		</div>
	{/each}
</div>
<div class="flex flex-wrap">
	{#each [...cards.high, ...cards.middle, ...cards.low] as card}
		<Card {card} />
	{/each}
</div>
