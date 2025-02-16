import { type Static, t } from 'elysia';
import webPush from 'web-push';
import { Check } from '@sinclair/typebox/value';
import { env } from '$env/dynamic/private';

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

export async function push<T extends Record<'message' | (string & {}), any>>(
	sub: Static<typeof subscription>,
	data: T
) {
	const nonce = crypto.randomUUID();

	await webPush.sendNotification(sub, JSON.stringify({ nonce, ...data }));

	return nonce;
}
