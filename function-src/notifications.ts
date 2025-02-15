import type { AuthUser } from '../common/communication';
import { db } from './common/db';
import { Push } from '../db/schema';
import type { Infer } from './common/type';
import { push, subscription } from './common/notifications';

post.params = { body: subscription };
export async function post(user: AuthUser, req: Infer<typeof post.params>) {
	const subscriptionInput = req.body;

	await db.insert(Push).values({ userId: user.id, ...subscriptionInput });

	const nonce = push(subscriptionInput, { message: "You've turned on notifications!" });

	return { nonce };
}
