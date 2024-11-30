import webPush from 'web-push';
import { t } from 'elysia';
import { Check, Convert, Value } from '@sinclair/typebox/value';

import { AuthUser } from '../common/communication';
import { db } from './common/db';
import { Push } from '../db/schema';
import { Infer } from './common/type';

const validSub = t.Object({
	endpoint: t.String(),
	keys: t.Object({
		p256dh: t.String(),
		auth: t.String(),
	}),
});

const validEnv = t.Object({
	NOTIFICATION_MAIL: t.String(),
	PUBLIC_KEY: t.String(),
	PRIVATE_KEY: t.String(),
});

const env = process.env;
const envFits = Check(validEnv, env);
if (!envFits) {
	console.error({
		NOTIFICATION_MAIL: !!process.env.NOTIFICATION_MAIL,
		PUBLIC_KEY: !!process.env.PUBLIC_KEY,
		PRIVATE_KEY: !!process.env.PRIVATE_KEY,
	});
	throw new Error('Env variables not set for notifications!');
}

webPush.setVapidDetails(env.NOTIFICATION_MAIL, env.PUBLIC_KEY, env.PRIVATE_KEY);

post.params = { body: validSub };
export async function post(user: AuthUser, req: Infer<typeof post.params>) {
	const subscriptionInput = req.body;

	await db.insert(Push).values({ userId: user.id, ...subscriptionInput });

	const nonce = crypto.randomUUID();

	webPush.sendNotification(
		subscriptionInput,
		JSON.stringify({ nonce, message: 'This is a test!' })
	);

	return { message: 'Subscribed successfully!', data: { nonce } };
}
