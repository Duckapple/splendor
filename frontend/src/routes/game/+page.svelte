<script lang="ts">
	import { authed } from '$lib/main';
	import { readable } from 'svelte/store';
	import { createQuery } from '@tanstack/svelte-query';

	import Actions from './Actions.svelte';
	import Card from '../test/Card.svelte';
	import { cardFromId } from '../../../../common/defaults';
	import Person from '../test/Person.svelte';

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
		<div class="flex gap-2">
			{#each $game.data?.data.shown.persons ?? [] as cardId}
				<Person card={cardFromId(cardId)} />
			{/each}
		</div>
		<div class="flex gap-2">
			{#each $game.data?.data.shown.high ?? [] as cardId}
				<Card card={cardFromId(cardId)} />
			{/each}
		</div>
		<div class="flex gap-2">
			{#each $game.data?.data.shown.middle ?? [] as cardId}
				<Card card={cardFromId(cardId)} />
			{/each}
		</div>
		<div class="flex gap-2">
			{#each $game.data?.data.shown.low ?? [] as cardId}
				<Card card={cardFromId(cardId)} />
			{/each}
		</div>
	</div>

	<pre>{JSON.stringify($game.data, null, 2)}</pre>
</div>
