import { getClient } from '$lib/main';
import { queryOptions } from '@tanstack/svelte-query';

export const roomsQuery = (fetch: typeof globalThis.fetch) =>
	queryOptions({
		queryKey: ['rooms'],
		queryFn: () => getClient(fetch).api.room.index.get({ query: {} }),
	});
