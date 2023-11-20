<script lang="ts">
	import { authed } from '$lib/main';
	import { readable } from 'svelte/store';
	import { createQuery } from '@tanstack/svelte-query';

	import Actions from './Actions.svelte';

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

	<pre>{JSON.stringify($game.data, null, 2)}</pre>
</div>
