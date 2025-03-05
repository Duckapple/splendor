import { roomsQuery } from './_queries.js';

export async function load({ parent, fetch }) {
	const { queryClient } = await parent();
	queryClient.prefetchQuery(roomsQuery(fetch));
}
