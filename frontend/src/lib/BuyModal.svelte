<script lang="ts">
	import { Color, type Card, type Player } from '../../../common/model';
	import { cardFromId } from '../../../common/defaults';
	import { getBonusFromCards, canAfford } from '../../../common/logic';
	import { only } from '../../../common/filter-utils';

	import Counter from '../routes/Counter.svelte';
	import Modal from './Modal.svelte';

	export let closeModal: () => void;
	export let open: boolean;
	export let cardId: number | undefined;
	export let player: Player | undefined;

	export let center: HTMLDivElement;

	$: card = cardId != null ? cardFromId(cardId) : null;
	$: bonus = player != null ? getBonusFromCards(player.cards) : null;

	$: maxValues = bonus?.map((b, i) =>
		Math.min(player?.tokens[i] ?? 0, Math.max(0, (card?.cost[i] ?? 0) - b))
	);

	let values = [0, 0, 0, 0, 0, 0];

	let isFree = false;
	let minValues = [0, 0, 0, 0, 0, 0];

	function init() {
		if (player != null && card != null) {
			const p = player;
			const res = canAfford(card, player, [0, 0, 0, 0, 0, 0]);

			if (res.isOk()) {
				isFree = true;
				return;
			}
			values = [...(res.error as { cost: Card['cost'] }).cost, 0].map((i) => Math.max(0, i));
			minValues = values.map((i) => Math.max(0, i - p.tokens[Color.Y]));
		}
	}

	$: cardId == null ? ((values = [0, 0, 0, 0, 0, 0]), (isFree = false)) : init();

	$: console.log(minValues);
	$: console.log('values', values);
</script>

<Modal bind:closeModal bind:open>
	<div class="w-56 h-56 md:w-[28rem] md:h-[28rem] flex justify-center items-center">
		<div bind:this={center} class="w-0 h-0" />
	</div>
	{#if isFree}
		<div>You can buy it for free!</div>
	{:else}
		Want to buy this card?
		<div class="flex justify-center gap-2">
			{#each Object.values(Color).filter(only('number')) as color}
				<Counter
					bind:color
					increment={() => (values[color] += 1)}
					max={maxValues?.[color]}
					value={values[color]}
					min={minValues?.[color]}
					decrement={() => (values[color] -= 1)}
					invalid={values[color] < (minValues?.[color] ?? 0) ||
						values[color] > (maxValues?.[color] ?? 0)}
				/>
			{/each}
		</div>
	{/if}
</Modal>
