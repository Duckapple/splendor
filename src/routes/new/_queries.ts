import { getClient } from '$lib/main';
import { queryOptions } from '@tanstack/svelte-query';

export const roomQuery = (fetch: typeof globalThis.fetch, searchId: string | null) =>
	queryOptions({
		queryKey: ['room', searchId],
		queryFn: async () => {
			if (searchId == null) throw { message: 'ID undefined' };
			const res = await getClient(fetch).api.room({ id: searchId }).get();
			return res;
		},
	});
