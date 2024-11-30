import { Elysia, type Static } from 'elysia';
import cors from '@elysiajs/cors';
import jwt from '@elysiajs/jwt';

import * as roomRoutes from './function-src/room';
import * as gameRoutes from './function-src/game';
import * as actionRoutes from './function-src/action';
import * as loginRoutes from './function-src/log-in';
import * as registerRoutes from './function-src/register';
import * as notificationsRoutes from './function-src/notifications';

import { FunctionError } from './function-src/common/httpGuarded';
import { authSchema, loginSchema } from './function-src/common/auth';

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
				if (!user) return error(401, { message: 'Unauthorized', data: 'Invalid JWT Token' });
			});
		},
	}));

export const App = new Elysia()
	.use(cors())
	.use(Auth)
	.error({ FunctionError })
	.onError(({ code, error, route }) => {
		switch (code) {
			case 'FunctionError':
				console.warn(new Date(), '[warn] ', route, error.status);
				return new Response(JSON.stringify(error.json), { status: error.status });
		}
	})
	.get('/ping', 'Pong!')
	.onAfterResponse(({ route }) => {
		console.debug(new Date(), '[debug]', route);
	})
	.post('/register', ({ jwt, body }) => registerRoutes.post(body, jwt.sign), { body: loginSchema })
	.post('/log-in', async ({ jwt, body }) => loginRoutes.post(body, jwt.sign), { body: loginSchema })
	.group('/room', { auth: true }, (app) =>
		app
			.post('/', ({ user }) => roomRoutes.post(user))
			.get('/', ({ user, query }) => roomRoutes.get(user, query), roomRoutes.get.params)
			.put('/', ({ user, query }) => roomRoutes.put(user, query), roomRoutes.put.params)
	)
	.group('/game', { auth: true }, (app) =>
		app
			.get('/', ({ user, query }) => gameRoutes.get(user, { query }), gameRoutes.get.params)
			.post('/', ({ user, query }) => gameRoutes.post(user, { query }), gameRoutes.post.params)
	)
	.group('/action', { auth: true }, (app) =>
		app
			.get('/', ({ user, query }) => actionRoutes.get(user, { query }), actionRoutes.get.params)
			.post(
				'/',
				({ user, query, body }) => actionRoutes.post(user, { query, body }),
				actionRoutes.post.params
			)
	)
	.group('/notifications', { auth: true }, (app) =>
		app.post(
			'/',
			({ user, body }) => notificationsRoutes.post(user, { body }),
			notificationsRoutes.post.params
		)
	)
	.listen(3000);

console.info(new Date(), '[info] ', 'live!');
