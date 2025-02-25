import { Elysia, t } from 'elysia';

import { Auth, FunctionError, loginSchema } from './function-src/common/auth';
import { RedirectError } from './function-src/common/error';

import { room } from './function-src/room';
import * as gameRoutes from './function-src/game';
import * as actionRoutes from './function-src/action';
import * as loginRoutes from './function-src/log-in';
import * as registerRoutes from './function-src/register';
import * as notificationsRoutes from './function-src/notifications';
import * as joinRoutes from './function-src/join';

const PORT = process.env.PORT;

if (!PORT) {
	console.error(new Date(), '[fatal]', 'PORT was not defined in .env!');
	throw new Error();
}

export const app = new Elysia({ prefix: '/api' })
	// .use(cors())
	.use(Auth)
	.get('/ping', 'Pong!')
	.error({ FunctionError, RedirectError })
	.onError(({ code, error, set, headers, redirect }) => {
		if (code === 'FunctionError') {
			set.headers = { ...headers, 'Content-Type': 'application/json' };
			return new Response(JSON.stringify(error.json), { status: error.status });
		}
		if (code === 'RedirectError') {
			return redirect(error.location, error.status);
		}
	})
	.onAfterResponse(({ route }) => {
		console.debug(new Date(), '[debug]', route);
	})
	.post(
		'/register',
		({ jwt, body, cookie: { accessToken } }) =>
			registerRoutes.post(body, jwt.sign, (value) => accessToken.set({ value, maxAge: 34550000 })),
		{ body: loginSchema }
	)
	.post(
		'/log-in',
		async ({ jwt, body, cookie: { accessToken } }) =>
			loginRoutes.post(body, jwt.sign, (value) => accessToken.set({ value, maxAge: 34550000 })),
		{ body: loginSchema }
	)
	.guard({ auth: true })
	.use(room)
	.group('/game', (app) =>
		app
			.get('/:id', ({ user, params: { id } }) => gameRoutes.get(user, id))
			.post('/:id', ({ user, params: { id } }) => gameRoutes.post(user, id))
	)
	.group('/action', (app) =>
		app
			.get(
				'/:id',
				({ user, params, query }) => actionRoutes.get(user, { params, query }),
				actionRoutes.get.params
			)
			.post(
				'/:id',
				({ user, params, body }) => actionRoutes.post(user, { params, body }),
				actionRoutes.post.params
			)
	)
	.group('/notifications', (app) =>
		app.post(
			'/',
			({ user, body }) => notificationsRoutes.post(user, { body }),
			notificationsRoutes.post.params
		)
	)
	.get('/join', ({ user, query }) => joinRoutes.get(user, { query }), joinRoutes.get.params);

export type App = typeof app;
