import { parse } from 'valibot';
import { compareSync } from 'bcrypt';
import { eq } from 'drizzle-orm';

import { User } from '../db/schema';

import { FunctionError, httpGuarded } from './common/httpGuarded';
import { login, makeJwt } from './common/auth';
import { db } from './common/db';

httpGuarded('log-in', {
	POST: async (req) => {
		const { userName, password } = parse(login, req.body);
		const [user] = await db.select().from(User).where(eq(User.userName, userName));
		if (user == null) {
			throw new FunctionError(404, { message: 'User not found' });
		}
		const hasCredentials = compareSync(password, user.bcrypt);
		if (!hasCredentials) {
			throw new FunctionError(401, { message: 'Wrong password' });
		}
		const jwt = makeJwt({ id: user.id, userName: user.userName });
		return { data: { jwt }, message: 'Logged in!', status: 'success' };
	},
});
