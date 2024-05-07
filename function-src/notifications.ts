import { randomUUID } from 'crypto';
import { object, parse, string } from 'valibot';
import webPush from 'web-push';

import { AuthUser } from '../common/communication';
import { db } from './common/db';
import { httpGuarded, authedHandler, Request } from './common/httpGuarded';
import { Push } from '../db/schema';

const validSub = object({
	endpoint: string(),
	keys: object({
		p256dh: string(),
		auth: string(),
	}),
});

const validEnv = object({
	MAIL: string(),
	PUBLIC_KEY: string(),
	PRIVATE_KEY: string(),
});

const env = parse(validEnv, process.env);

webPush.setVapidDetails(env.MAIL, env.PUBLIC_KEY, env.PRIVATE_KEY);

httpGuarded('notifications', {
	POST: authedHandler(post),
	// GET: authedHandler(get),
});

async function post(user: AuthUser, req: Request) {
	const subscriptionInput = parse(validSub, req.body);

	await db.insert(Push).values({ userId: user.id, ...subscriptionInput });

	const nonce = randomUUID();

	webPush.sendNotification(
		subscriptionInput,
		JSON.stringify({ nonce, message: 'This is a test!' })
	);

	return { message: 'Subscribed successfully!', data: { nonce } };
}
