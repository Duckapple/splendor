<script lang="ts">
	import { authed, cachedWritable } from '$lib/main';
	import { createQuery } from '@tanstack/svelte-query';
	import type { Action } from '../../../../common/model';

	export let gameId: string;

	const actionsCache = cachedWritable<Action[]>(`actions-${gameId}`, []);

	const actions = createQuery({
		queryKey: ['actions', gameId],
		async queryFn() {
			const last = $actionsCache.at(-1);
			const params: Record<string, string> = { gameId: gameId };
			if (last != null) params['since'] = last.timestamp as unknown as string;
			const data = await authed({
				route: '/action',
				method: 'GET',
				params,
			});
			actionsCache.update((cache) => cache.concat(data.data));
			return $actionsCache;
		},
		initialData: $actionsCache,
	});
</script>

<div>
	{#each $actions.data ?? [] as action}
		<pre class="w-48 h-8">{JSON.stringify(action.data)}</pre>
	{/each}
</div>
