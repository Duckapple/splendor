<script lang="ts">
	import { authed } from '$lib/main';
	import { readable } from 'svelte/store';
	import { createQuery } from '@tanstack/svelte-query';

	import Actions from './Actions.svelte';
	import Card from '../test/Card.svelte';
	import { cardFromId } from '../../../../common/defaults';
	import Person from '../test/Person.svelte';
	import BuyModal from '$lib/BuyModal.svelte';

	let center: HTMLDivElement;
	let target: HTMLElement | undefined = undefined;

	function setCurrent(newVal: HTMLElement | undefined) {
		if (target) {
			target.setAttribute('style', '');
		}
		target = newVal;
	}
	function handleClick(e: MouseEvent | KeyboardEvent) {
		if ('key' in e && !['Space', 'Enter'].includes(e.key)) {
			return;
		}
		const newTarget = e.currentTarget;
		if (newTarget instanceof HTMLElement) {
			if (target === newTarget) {
				setCurrent(undefined);
				return;
			}
			setCurrent(newTarget);
			requestAnimationFrame(() => {
				const { left, top } = newTarget.getBoundingClientRect();
				const { x: centerLeft, y: centerTop } = center.getBoundingClientRect();

				newTarget.setAttribute(
					'style',
					`transform: rotate(0) translate(${centerLeft - left - newTarget.clientWidth / 2}px, ${
						centerTop - top - newTarget.clientHeight / 2
					}px) scale(2); z-index: 30`
				);
			});
		}
	}

	const searchId = readable(new URLSearchParams(globalThis.location?.search).get('id'));

	const game = createQuery({
		queryKey: ['game', $searchId],
		queryFn() {
			if ($searchId == null) throw { message: 'ID undefined' };
			const params = { id: $searchId };
			return authed({
				route: '/game',
				method: 'GET',
				params,
			});
		},
	});
</script>

<div>
	{$searchId}
	{JSON.stringify($game.error)}

	{#if $searchId != null}<Actions gameId={$searchId} />{/if}

	<div class="space-y-4">
		<div class="flex gap-2 md:gap-4">
			{#each $game.data?.data.shown.persons ?? [] as cardId}
				<Person card={cardFromId(cardId)} on:click={handleClick} on:keypress={handleClick} />
			{/each}
		</div>
		<div class="flex gap-2 md:gap-4">
			{#each $game.data?.data.shown.high ?? [] as cardId}
				<Card card={cardFromId(cardId)} on:click={handleClick} on:keypress={handleClick} />
			{/each}
		</div>
		<div class="flex gap-2 md:gap-4">
			{#each $game.data?.data.shown.middle ?? [] as cardId}
				<Card card={cardFromId(cardId)} on:click={handleClick} on:keypress={handleClick} />
			{/each}
		</div>
		<div class="flex gap-2 md:gap-4">
			{#each $game.data?.data.shown.low ?? [] as cardId}
				<Card card={cardFromId(cardId)} on:click={handleClick} on:keypress={handleClick} />
			{/each}
		</div>
	</div>

	<pre>{JSON.stringify($game.data, null, 2)}</pre>
</div>

<BuyModal
	closeModal={() => setCurrent(undefined)}
	open={target != null}
	cardId={target?.dataset.cardId ? Number(target?.dataset.cardId) : undefined}
	player={{ cards: [0, 1, 2, 3], reserved: [], tokens: [2, 0, 0, 0, 0, 1] }}
	bind:center
/>
