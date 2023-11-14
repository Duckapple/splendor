import { parse } from "valibot";
import { httpGuarded } from "./common/httpGuarded";
import { login, makeJwt } from "./common/auth";
import { compareSync } from "bcrypt";
import { db } from "./common/db";
import { User } from "../db/schema";
import { eq } from "drizzle-orm";

httpGuarded("log-in", async (req, res) => {
  const { userName, password } = parse(login, req.body);
  const [user] = await db
    .select()
    .from(User)
    .where(eq(User.userName, userName));
  if (user == null) {
    return res.status(404).json({ message: "User not found" });
  }
  const hasCredentials = compareSync(password, user.bcrypt);
  if (!hasCredentials) {
    return res.status(401).json({ message: "Wrong password" });
  }
  const jwt = makeJwt({ id: user.id, userName: user.userName });
  return res
    .status(200)
    .json({ jwt, message: "Logged in!", status: "success" });
});
