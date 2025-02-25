import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url, fetch, request }) => {
	console.log(request);

	redirect(303, `/new?id=${url.searchParams.get('id')}`);
};
