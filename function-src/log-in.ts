import type { Static } from 'elysia';
import { eq } from 'drizzle-orm';
import { User } from '../db/schema';
import { db } from './common/db';
import { FunctionError } from './common/auth';
import type { authSchema, loginSchema } from './common/auth';

export async function post(
	{ userName, password }: Static<typeof loginSchema>,
	sign: (i: Static<typeof authSchema>) => Promise<string>
) {
	const [user] = await db.select().from(User).where(eq(User.userName, userName));
	if (user == null) {
		throw new FunctionError(404, { message: 'User not found' });
	}
	if (!Bun.password.verifySync(password, user.bcrypt)) {
		throw new FunctionError(401, { message: 'Wrong password' });
	}

	const newJwt = await sign({ id: user.id, userName: user.userName });

	return { jwt: newJwt };
}
