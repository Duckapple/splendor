import { Elysia, t, Static } from 'elysia';
import * as roomRoutes from './function-src/room';
import cors from '@elysiajs/cors';
import jwt from '@elysiajs/jwt';
import { db } from './function-src/common/db';
import { User } from './db/schema';
import { eq } from 'drizzle-orm';
import { FunctionError } from './function-src/common/httpGuarded';

const authSchema = t.Object({ id: t.String(), userName: t.String() });
const Auth = new Elysia({ name: 'Service.Auth' })
	.use(
		jwt({
			secret: process.env.JWT_SECRET!,
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
				console.log(user);
				if (!user) {
					return error(401, { message: 'Unauthorized', data: 'Invalid JWT Token' });
				}
			});
		},
	}));

export const App = new Elysia()
	.use(cors())
	.use(Auth)
	.error({ FunctionError })
	.onError(({ code, error }) => {
		switch (code) {
			case 'FunctionError':
				return new Response(JSON.stringify(error.json), { status: 403 });
		}
	})
	.get('/ping', 'Pong!')
	.post(
		'/log-in',
		async ({ set, jwt, body: { password, userName } }) => {
			const [user] = await db.select().from(User).where(eq(User.userName, userName));
			if (user == null) {
				set.status = 404;
				return { message: 'User not found' };
			}
			if (!Bun.password.verifySync(password, user.bcrypt, 'bcrypt')) {
				set.status = 401;
				return { message: 'Wrong password' };
			}

			const newJwt = await jwt.sign({ id: user.id, userName: user.userName });

			return { data: { jwt: newJwt }, message: 'Logged in!', status: 'success' };
		},
		{ body: t.Object({ userName: t.String(), password: t.String() }) }
	)
	.group('/room', { auth: true }, (app) => {
		const optionalId = t.Object({ id: t.Optional(t.String()) });
		const requiredId = t.Object({ id: t.String() });
		return app
			.post('/', ({ user }) => roomRoutes.post(user))
			.get('/', ({ query, user }) => roomRoutes.get(user, query), { query: optionalId })
			.put('/', ({ user, query }) => roomRoutes.put(user, query), { query: requiredId });
	})
	.listen(3000);

console.info('live!', new Date());
