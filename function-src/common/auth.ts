import jwt from '@elysiajs/jwt';
import Elysia, { type Static, t } from 'elysia';

import { env } from '$env/dynamic/private';

export const authSchema = t.Object({ id: t.String(), userName: t.String() });

export const loginSchema = t.Object({
	userName: t.String({ minLength: 2, maxLength: 64 }),
	password: t.String({ minLength: 8, maxLength: 128 }),
});

export class FunctionError extends Error {
	constructor(public status: number, public json: { message: string; data?: any }) {
		super();
	}
}

export const Auth = new Elysia({ name: 'Service.Auth' })
	.use(
		jwt({
			secret: env.JWT_SECRET!,
			name: 'jwt',
			alg: 'HS512',
			schema: authSchema,
		})
	)
	.derive({ as: 'scoped' }, async ({ headers, jwt }) => {
		const bearer = headers.authorization?.split(' ')[1];
		return {
			bearer,
			user: (await jwt.verify(bearer)) as Static<typeof authSchema>,
		};
	})
	.macro(({ onBeforeHandle }) => ({
		auth(_: true) {
			onBeforeHandle(async ({ user, error }) => {
				if (!user) return error(401, { message: 'Unauthorized', data: 'Invalid JWT Token' });
			});
		},
	}));
