import { gameQuery } from './_queries.js';

export async function load({ parent, fetch, url }) {
	const { queryClient } = await parent();
	const id = url.searchParams.get('id');
	queryClient.prefetchQuery(gameQuery(fetch, id));
}
