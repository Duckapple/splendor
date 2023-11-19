<script>
	import { authed, user } from '$lib/main';
	import { readable } from 'svelte/store';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	const search = readable(new URLSearchParams(globalThis.location?.search));
	const game = createQuery({
		queryKey: ['game', $search],
		queryFn: () => {
			const rawParams = Object.fromEntries($search.entries());
			const params = { id: rawParams.id };
			return authed({
				route: '/game',
				method: 'GET',
				params,
			});
		},
	});
</script>

<div>
	{$search}
	<button on:click={() => globalThis.location && (globalThis.location.search = '?id=null')}>
		Change search query
	</button>
	{JSON.stringify($game.error)}

	<pre>{JSON.stringify($game.data, null, 2)}</pre>
</div>
