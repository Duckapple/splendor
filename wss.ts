import { Elysia, t } from 'elysia';
import { Auth } from './function-src/common/auth';
import { ServerWebSocketSendStatus } from 'bun';
import cors from '@elysiajs/cors';

const messageSchema = t.Union([
	t.Object({
		type: t.Literal('register'),
		token: t.String(),
	}),
	t.Object({
		type: t.Literal('repeat'),
		message: t.String(),
	}),
]);

const cache: Record<string, (data: unknown, compress?: boolean) => ServerWebSocketSendStatus> = {};

export const app = new Elysia()
	.get('/ping', 'Pong!')
	.use(cors({ origin: ['splendor.simon-green.dev', 'api-splendor.simon-green.dev'] }))
	.use(Auth)
	// .post('/forward', async ({ body }) => {}, { auth: true })
	.ws('/ws', {
		body: messageSchema,
		async message(ws, message) {
			switch (message.type) {
				case 'register': {
					const verified = await ws.data.jwt.verify(message.token);
					if (!verified) {
						ws.send({ status: 401, message: 'Unauthorized' });
						ws.close(4001, 'Unauthorized');
						break;
					}
					ws.send({ status: 200, message: 'OK' });
					cache[ws.id] = ws.send;
					break;
				}
				case 'repeat':
					cache[ws.id]('Hello!');
					break;
			}
		},
		close(ws) {
			delete cache[ws.id];
		},
	});

export type WSApp = typeof app;
