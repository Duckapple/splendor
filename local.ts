import { Elysia } from 'elysia';
import cors from '@elysiajs/cors';

import { Auth, loginSchema } from './function-src/common/auth';

import { room } from './function-src/room';
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

export const app = new Elysia()
	.use(cors({ origin: true }))
	.use(Auth)
	.get('/ping', 'Pong!')
	.onAfterResponse(({ route }) => {
		console.debug(new Date(), '[debug]', route);
	})
	.post('/register', ({ jwt, body }) => registerRoutes.post(body, jwt.sign), { body: loginSchema })
	.post('/log-in', async ({ jwt, body }) => loginRoutes.post(body, jwt.sign), { body: loginSchema })
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
	.listen(PORT);

console.info(new Date(), '[info] ', 'Server is listening on port', PORT);

export type App = typeof app;
