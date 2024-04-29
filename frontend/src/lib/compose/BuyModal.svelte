<script lang="ts">
	import { Color, type Card, type Player, type GameState } from '../../../../common/model';
	import {
		cardFromId,
		positionFromCardId,
		reservePositionFromCardId,
	} from '../../../../common/defaults';
	import { getBonusFromCards, canAfford } from '../../../../common/logic';
	import { only } from '../../../../common/filter-utils';

	import Counter from '../../routes/Counter.svelte';
	import Modal from '../Modal.svelte';
	import { authed } from '../main';
	import { createMutation } from '@tanstack/svelte-query';
	import InfoTooltip from '../InfoTooltip.svelte';

	export let closeModal: () => void;
	export let open: boolean;
	export let game: GameState | undefined;
	export let cardId: number | undefined;
	export let player: Player | undefined;

	export let center: HTMLDivElement;

	$: card = cardId != null ? cardFromId(cardId) : null;
	$: bonus = player != null ? getBonusFromCards(player.cards) : null;

	$: maxValues = bonus?.map((b, i) =>
		i === Color.Y
			? player?.tokens[i] ?? 0
			: Math.min(player?.tokens[i] ?? 0, Math.max(0, (card?.cost[i] ?? 0) - b))
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

	$: buyMutation = createMutation({
		mutationKey: ['action', 'BUY_CARD', cardId],
		async mutationFn() {
			if (!player || !game || cardId == null) {
				throw { message: 'Invalid initial state. Retry the action, this time slowly' };
			}
			const position =
				positionFromCardId(game.shown, cardId) ??
				reservePositionFromCardId(player.reserved, cardId);
			if (position == null || position[0] === 'persons') {
				throw { message: 'Card is somehow not in play?' };
			}
			const [row, i] = position;

			const body = {
				type: 'BUY_CARD',
				data: { row, i, card: cardId, tokens: values },
			};

			await authed({
				method: 'POST',
				route: '/action',
				params: { gameId: game.id },
				body,
			});

			closeModal();
		},
	});
</script>

<Modal
	bind:closeModal
	bind:open
	actions={[
		{
			colorClass: 'bg-green-200',
			text: 'Buy',
			handler: $buyMutation.mutateAsync,
		},
	]}
>
	<h1 class="flex justify-between text-xl">
		<span>Buy/reserve card</span>
		<InfoTooltip size="xl"><p>To buy a card, you need to be able to afford it.</p></InfoTooltip>
	</h1>
	<div class="w-56 h-56 md:w-[28rem] md:h-[28rem] flex justify-center items-center">
		<div bind:this={center} class="w-0 h-0" />
	</div>
	{#if isFree}
		<div>You can buy it for free!</div>
	{:else}
		Want to buy this card? {#if $buyMutation.isError}<span class="text-red-600"
				>{$buyMutation.error?.message}</span
			>{/if}
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
