import type { Request, Response } from '@google-cloud/functions-framework';
import JWT from 'jsonwebtoken';
import { AuthUser } from '../../common/communication';
import { t } from 'elysia';

export class AuthError extends Error {
	data: string | undefined;
	constructor(data?: string) {
		super('Unauthorized');
		this.data = data;
	}
}

export function withHeaders(
	res: Response,
	methods: ('POST' | 'GET' | 'OPTIONS' | 'PUT' | 'DELETE' | 'PATCH')[]
) {
	const headers: [string, string][] = [
		['Allow', methods.join(', ')],
		['Accept', 'application/json'],
		['Access-Control-Allow-Origin', '*'],
		['Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization'],
		['Access-Control-Max-Age', '86400'],
	];
	return headers.reduce((res, hdr) => res.header(...hdr), res);
}

export const authSchema = t.Object({ id: t.String(), userName: t.String() });

export const loginSchema = t.Object({
	userName: t.String({ minLength: 2, maxLength: 64 }),
	password: t.String({ minLength: 8, maxLength: 128 }),
});

if (process.env.JWT_SECRET == null) throw new Error('JWT_SECRET undefined');

const secret = process.env.JWT_SECRET;

export function ensureAuth(req: Request): AuthUser {
	const authHeader = req.headers.authorization;
	if (authHeader == null) throw new AuthError();

	const [_bearer, jwt] = authHeader.split(' ');
	if (jwt == null) throw new AuthError();

	try {
		const payload = JWT.verify(jwt, secret, {
			algorithms: ['HS512'],
		});
		return payload as AuthUser;
	} catch (e) {
		throw new AuthError('Invalid JWT Token');
	}
}
