import type { Request, Response, HttpFunction } from '@google-cloud/functions-framework';
import { http } from '@google-cloud/functions-framework';
import { ValiError, object, safeParse, string } from 'valibot';
import { AuthError, ensureAuth } from './auth';
import { AuthUser } from '../../common/communication';

const drizzleError = object({
	body: object({ message: string() }),
});

export class FunctionError extends Error {
	constructor(public status: number, public json: { message: string; data?: any }) {
		super();
	}
}

function withHeaders(
	res: Response,
	methods: ('POST' | 'GET' | 'OPTIONS' | 'PUT' | 'DELETE' | 'PATCH')[]
) {
	const allows = ['OPTIONS', ...methods].join(', ');
	const headers: [string, string][] = [
		['Allow', allows],
		['Accept', 'application/json'],
		['Access-Control-Allow-Origin', '*'],
		['Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization'],
		['Access-Control-Allow-Methods', allows],
		['Access-Control-Max-Age', '86400'],
	];
	return headers.reduce((res, hdr) => res.header(...hdr), res);
}

const methods = ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'] as const;
type Method = (typeof methods)[number];
type HandlerResult = {
	message?: string;
	data: Record<string, unknown> | Record<string, unknown>[];
};
type Handler = (req: Request) => Promise<HandlerResult>;
type Handlers = Partial<Record<Method, Handler>>;

export function httpGuarded(functionName: string, handlers: Handlers) {
	const acceptedMethods = Object.keys(handlers) as Method[];

	const guardedHandler: HttpFunction = async (req: Request, res: Response) => {
		try {
			if (req.method === 'OPTIONS') {
				return withHeaders(res, acceptedMethods).sendStatus(200);
			}
			if (!(acceptedMethods as string[]).includes(req.method)) {
				return withHeaders(res, acceptedMethods).sendStatus(404);
			}
			const handler = handlers[req.method] as Handler;

			const data = await handler(req);
			return withHeaders(res, acceptedMethods).status(200).json(data);
		} catch (e: unknown) {
			if (e instanceof FunctionError) {
				return withHeaders(res, acceptedMethods).status(e.status).json(e.json);
			}
			if (e instanceof AuthError) {
				return withHeaders(res, acceptedMethods)
					.status(401)
					.json({ message: 'Unauthorized', data: e.data });
			}
			if (e instanceof ValiError) {
				// ! DO NOT LOG `e`, CAN CONTAIN PASSWORD
				const saneError = {
					message: 'Invalid input',
					issues: e.issues.map((issue) => ({
						problem: issue.message,
						validation: issue.validation,
						path: issue.path?.map((path) => path.key),
					})),
				};
				return withHeaders(res, acceptedMethods)
					.status(400) // Bad Request
					.json(saneError);
			}
			const drizz = safeParse(drizzleError, e);
			if (drizz.success) {
				const isUniqueViolation = drizz.output.body.message.includes('code = AlreadyExists');
				if (isUniqueViolation) {
					return withHeaders(res, acceptedMethods).status(400).json({
						message: 'Already exists',
					});
				}
			}
			console.error(JSON.stringify(e));
			res.sendStatus(500);
		}
	};
	http(functionName, guardedHandler);
}

export function authedHandler(
	fn: (user: AuthUser, ...params: Parameters<Handler>) => ReturnType<Handler>
): Handler {
	return function (...[req, ...params]: Parameters<Handler>): ReturnType<Handler> {
		const user = ensureAuth(req);
		return fn(user, req, ...params);
	};
}
