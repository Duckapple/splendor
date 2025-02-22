import { Elysia, t, type Static } from 'elysia';
import { Auth } from './function-src/common/auth';
import type { ServerWebSocketSendStatus } from 'bun';
import cors from '@elysiajs/cors';
import { stateUpdateSchema } from './common/schema/game';

const messageSchema = t.Union([
	t.Object({
		type: t.Literal('register'),
		token: t.String(),
	}),
]);

const responseSchema = t.Union([
	t.Object({
		type: t.Literal('register'),
		status: t.Number(),
		message: t.String(),
	}),
	t.Object({
		type: t.Literal('game-update'),
		id: t.String(),
		update: t.Any() as unknown as typeof stateUpdateSchema,
	}),
]);

type UserID = string;
type WsID = string;

export const websocketCache: Record<
	UserID,
	| ((data: Static<typeof responseSchema>, compress?: boolean) => ServerWebSocketSendStatus)
	| undefined
> = {};

export const wsIdToUserId: Record<WsID, UserID> = {};

export const app = new Elysia()
	.get('/ping', 'Pong!')
	.use(cors({ origin: ['splendor.simon-green.dev', 'api-splendor.simon-green.dev'] }))
	.use(Auth)
	.ws('/ws', {
		body: messageSchema,
		response: responseSchema,
		async message(ws, message) {
			switch (message.type) {
				case 'register': {
					const verified = await ws.data.jwt.verify(message.token);
					if (!verified) {
						ws.send({ type: 'register', status: 401, message: 'Unauthorized' });
						ws.close(4001, 'Unauthorized');
						break;
					}
					ws.send({ type: 'register', status: 200, message: 'OK' });
					wsIdToUserId[ws.id] = verified.id;
					websocketCache[verified.id] = ws.send;
					break;
				}
			}
		},
		close(ws) {
			delete websocketCache[wsIdToUserId[ws.id]];
		},
	});

export type WSApp = typeof app;
