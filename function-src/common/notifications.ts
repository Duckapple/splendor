import { type Static, t } from 'elysia';
import webPush, { WebPushError } from 'web-push';
import { Check } from '@sinclair/typebox/value';
import { env } from '$env/dynamic/private';
import { Push } from '../../db/schema';
import { db } from './db';
import { eq } from 'drizzle-orm';

const validEnv = t.Object({
	NOTIFICATION_MAIL: t.String(),
	NOTI_PUBLIC_KEY: t.String(),
	PRIVATE_KEY: t.String(),
});

const envFits = Check(validEnv, env);
if (!envFits) {
	console.error({
		NOTIFICATION_MAIL: !!env.NOTIFICATION_MAIL,
		PUBLIC_KEY: !!env.NOTI_PUBLIC_KEY,
		PRIVATE_KEY: !!env.PRIVATE_KEY,
	});
	throw new Error('Env variables not set for notifications!');
}

webPush.setVapidDetails(env.NOTIFICATION_MAIL, env.NOTI_PUBLIC_KEY, env.PRIVATE_KEY);

export const subscription = t.Object({
	endpoint: t.String(),
	keys: t.Object({
		p256dh: t.String(),
		auth: t.String(),
	}),
});

export async function push<T extends Record<'message' | 'type' | (string & {}), any>>(
	{ userId, ...sub }: Push,
	data: T
) {
	const nonce = crypto.randomUUID();

	try {
		await webPush.sendNotification(sub, JSON.stringify({ nonce, ...data }));
	} catch (error) {
		if (error instanceof WebPushError && error.statusCode === 410) {
			await db.delete(Push).where(eq(Push.userId, userId));
			console.error(new Date(), '[error]', 'Subscription is no longer valid:', sub);
		} else {
			console.error(new Date(), '[error]', 'Failed to send notification:', error);
		}
	}

	return nonce;
}
