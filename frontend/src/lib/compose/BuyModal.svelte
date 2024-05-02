<script lang="ts">
	import { Color, type Card, type Player, type GameState } from '../../../../common/model';
	import {
		cardFromId,
		positionFromCardId,
		reservePositionFromCardId,
	} from '../../../../common/defaults';
	import { getBonusFromCards, canAfford, getEarnedPeople } from '../../../../common/logic';
	import { only } from '../../../../common/filter-utils';

	import Counter from '../../routes/Counter.svelte';
	import Modal from '../Modal.svelte';
	import { authed } from '../main';
	import { createMutation } from '@tanstack/svelte-query';
	import InfoTooltip from '../InfoTooltip.svelte';
	import Person from '$lib/game/Person.svelte';

	export let closeModal: () => void;
	export let open: boolean;
	export let game: GameState | undefined;
	export let cardId: number | undefined;
	export let player: Player | undefined;
	export let reserved: boolean;
	export let target: HTMLElement | undefined;

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

	$: potentialPersons =
		player && card
			? getEarnedPeople(game?.shown.persons ?? [], { ...player, cards: [...player.cards, card.id] })
			: [];

	let selectedPerson: number | null;

	$: decrement = (color: Color) => {
		values[color] -= 1;
		if (color !== Color.Y && (maxValues?.[Color.Y] ?? 0) > values[Color.Y]) values[Color.Y] += 1;
	};

	$: increment = (color: Color) => {
		values[color] += 1;
		if (color !== Color.Y && minValues[Color.Y] < values[Color.Y]) values[Color.Y] -= 1;
	};

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

			const personData =
				potentialPersons.length === 1
					? potentialPersons[0]
					: potentialPersons.find((p) => p[0] === selectedPerson);
			const person = personData != null ? { id: personData[0], i: personData[1] } : undefined;

			const body = {
				type: 'BUY_CARD',
				data: { row, i, card: cardId, tokens: values, person },
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

	$: reserveMutation = createMutation({
		mutationKey: ['action', 'RESERVE', cardId],
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
				type: 'RESERVE',
				data: { row, i, card: cardId },
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

	$: reserveAction = {
		colorClass: 'bg-amber-200',
		text: 'Reserve',
		handler: $reserveMutation.mutateAsync,
	};
</script>

<Modal
	bind:closeModal
	bind:open
	actions={[
		...(reserved ? [] : [reserveAction]),
		{
			colorClass: 'bg-green-200',
			text: 'Buy',
			handler: $buyMutation.mutateAsync,
		},
	]}
>
	<h1 class="flex justify-between text-xl">
		<span>Buy/reserve card</span>
		<InfoTooltip
			size="xl"
			on:pointerenter={() => {
				if (window.matchMedia('(min-width: 768px)').matches) return;
				target && target.setAttribute('style', target.getAttribute('style') + '; opacity: 0');
			}}
			on:pointerleave={() =>
				target &&
				target.setAttribute(
					'style',
					target.getAttribute('style')?.replace('; opacity: 0', '') ?? ''
				)}
		>
			<div class="space-y-1">
				<p>To buy a card, you need to afford it through bonuses and tokens.</p>
				<p>
					The cost can be seen in the bottom left corner of the card, where each circle shows the
					cost along with what color is needed.
				</p>
				<p>
					Each card you possess counts towards paying the cost, and you can spend tokens to make up
					any difference.
				</p>
				<p>
					Additionally, the yellow tokens are "wild", and can act as any other color when buying a
					card.
				</p>
				<br />
				<p>
					To buy a card, make sure you can afford it, and press the "buy" button. You know you can
					afford it by the counters under the card, where a red underline means you don't have the
					required amount of tokens.
				</p>
				{#if !reserved}
					<br />
					<p>
						Alternatively, you can reserve the card so you can buy it on a later turn. If you choose
						to do so, you also get a yellow token to go with it.
					</p>
				{/if}
			</div>
		</InfoTooltip>
	</h1>
	<div class="w-56 h-56 md:w-[28rem] md:h-[28rem] flex justify-center items-center">
		<div bind:this={center} class="w-0 h-0" />
	</div>
	{#if isFree}
		<div>
			You can buy it for free! <span class="text-red-600"
				>{$buyMutation.error?.message ?? $reserveMutation.error?.message ?? ''}</span
			>
		</div>
	{:else}
		Want to buy this card? <span class="text-red-600"
			>{$buyMutation.error?.message ?? $reserveMutation.error?.message ?? ''}</span
		>
		<div class="flex justify-center gap-2">
			{#each Object.values(Color).filter(only('number')) as color}
				<Counter
					bind:color
					{increment}
					max={maxValues?.[color]}
					value={values[color]}
					min={minValues?.[color]}
					{decrement}
					invalid={values[color] < (minValues?.[color] ?? 0) ||
						values[color] > (maxValues?.[color] ?? 0)}
				/>
			{/each}
		</div>
	{/if}
	{#if potentialPersons.length > 0}
		By buying this card, you also get a noble.
		{potentialPersons.length > 1 ? 'Choose one:' : ''}
		<div class="flex justify-center gap-4 p-2 md:gap-6">
			{#each potentialPersons as [personId]}
				<div class="rounded-md ring-4 ring-offset-4" class:ring-4={selectedPerson === personId}>
					<Person
						card={cardFromId(personId)}
						on:click={() => (selectedPerson = selectedPerson === personId ? null : personId)}
					/>
				</div>
			{/each}
		</div>
	{/if}
</Modal>
