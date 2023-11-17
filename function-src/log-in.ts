import { parse } from "valibot";
import { FunctionError, httpGuarded } from "./common/httpGuarded";
import { login, makeJwt } from "./common/auth";
import { compareSync } from "bcrypt";
import { db } from "./common/db";
import { User } from "../db/schema";
import { eq } from "drizzle-orm";

httpGuarded("log-in", {
  POST: async (req) => {
    const { userName, password } = parse(login, req.body);
    const [user] = await db
      .select()
      .from(User)
      .where(eq(User.userName, userName));
    if (user == null) {
      throw new FunctionError(404, { message: "User not found" });
    }
    const hasCredentials = compareSync(password, user.bcrypt);
    if (!hasCredentials) {
      throw new FunctionError(401, { message: "Wrong password" });
    }
    const jwt = makeJwt({ id: user.id, userName: user.userName });
    return { jwt, message: "Logged in!", status: "success" };
  },
});
