import { getClient } from '$lib/main';
import { queryOptions } from '@tanstack/svelte-query';

export const gameQuery = (fetch: typeof globalThis.fetch, searchId: string | null) =>
	queryOptions({
		queryKey: ['game', searchId],
		async queryFn() {
			if (searchId == null) throw { message: 'ID undefined' };
			return await getClient(fetch).api.game({ id: searchId }).get();
		},
	});
