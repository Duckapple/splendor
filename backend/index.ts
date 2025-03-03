import { http, type HttpFunction } from '@google-cloud/functions-framework';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import webPush from 'web-push';
import { err, fromThrowable, ok } from 'neverthrow';
import { object, safeParse as _safeParse, string, BaseSchema } from 'valibot';
import { randomUUID } from 'crypto';

import { newGameState } from '../common/defaults';
import { Push, User } from '../db/schema';

import process from '$env/dynamic/private';

function safeParse<TSchema extends BaseSchema>(schema: TSchema) {
	return function (data: unknown) {
		const val = _safeParse(schema, data);
		return val.success ? ok(val.output) : err(val.issues);
	};
}

const requiredEnv = ['MAIL', 'PUBLIC_KEY', 'PRIVATE_KEY'] as const;

const env: Record<(typeof requiredEnv)[number], string> = Object.fromEntries(
	requiredEnv.map((e) => {
		const value = process.env[e];
		if (!value) throw new Error(`Environment variable '${env}' not set`);
		return [env, value];
	})
) as any;

webPush.setVapidDetails(env['MAIL'], env['PUBLIC_KEY'], env['PRIVATE_KEY']);

const connection = neon(process.env.DATABASE_URL!);

const db = drizzle(connection);

const ds = {
	key(arr: [string, string]) {
		return arr.join('--');
	},
	save(x) {
		return x;
	},
	get(key: string) {
		return new Promise<any>((res) => res([{ pushSubscription: {} }]));
	},
};

http('splendor-test', async (req, res) => {
	if (req.method === 'POST' && req.body) {
		return sub(req, res);
	}

	const y = await db
		.select()
		.from(User)
		.where(eq(User.userName, 'Duckapple'))
		.leftJoin(Push, eq(User.id, Push.userId));

	res.send(y.map((d) => ({ ...d.Push, userName: d.User.userName })));

	return;

	// const data = await db.select().from(testTable);

	const kind = 'Splendor Game State';

	const name = req.query.name?.toString() || 'default';

	// The Cloud Datastore key for the new entity
	const key = ds.key([kind, name]);

	// const existing = await ds.get(key);
	// console.log(existing);

	const state = newGameState(2);

	const task = {
		key,
		data: {
			state: JSON.stringify(state),
			updatedAt: new Date().toISOString(),
		},
	};

	// Notify the main guy lmao
	// push('<UUID GOES HERE>')

	// Saves the entity
	const x = await ds.save(task);
	res.send(
		`<p>Saved ${name}<p>\n<pre>${JSON.stringify(x, null, 2)}\n${JSON.stringify(
			state,
			null,
			2
		)}</pre>`
	);
});

const validSub = object({
	endpoint: string(),
	keys: object({
		p256dh: string(),
		auth: string(),
	}),
});

const sub: HttpFunction = async (req, res) => {
	res.setHeader('Content-type', 'application/json');

	const body = fromThrowable(JSON.parse)(req.body).andThen(safeParse(validSub));

	if (body.isErr()) {
		return res.status(400).send({ status: 'error', message: 'Bad JSON body', details: body.error });
	}

	const uuid = randomUUID();
	const key = ds.key(['push', uuid]);

	await ds.save({ key, data: { pushSubscription: body.value } });

	res.send({
		status: 'success',
		message: 'Push subscription initialized, UUID assigned',
		details: { uuid },
	});
};

async function push(uuid: string) {
	const noti = await ds.get(ds.key(['push', uuid]));
	const pushSubscription = JSON.parse(noti[0].pushSubscription);
	webPush.sendNotification(pushSubscription, 'Your Push Payload Text');
}
