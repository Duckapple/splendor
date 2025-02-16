import { app } from '../../../../../local';

type RequestHandler = (v: { request: Request }) => Response | Promise<Response>;

function tap<T>(t: T): T {
	console.log(t);
	return t;
}

export const GET: RequestHandler = ({ request }) => app.handle(tap(request));
export const POST: RequestHandler = ({ request }) => app.handle(request);
export const PUT: RequestHandler = ({ request }) => app.handle(request);
