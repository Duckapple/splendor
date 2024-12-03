import { Elysia } from 'elysia';
import cors from '@elysiajs/cors';

import { Auth, FunctionError, loginSchema } from './function-src/common/auth';

import * as roomRoutes from './function-src/room';
import * as gameRoutes from './function-src/game';
import * as actionRoutes from './function-src/action';
import * as loginRoutes from './function-src/log-in';
import * as registerRoutes from './function-src/register';
import * as notificationsRoutes from './function-src/notifications';

const PORT = process.env.PORT;

if (!PORT) {
	console.error(new Date(), '[fatal]', 'PORT was not defined in .env!');
	throw new Error();
}

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
	.listen(PORT);

console.info(new Date(), '[info] ', 'Server is listening on port', PORT);
