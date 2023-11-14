import { parse } from "valibot";
import { hashSync } from "bcrypt";
import { User } from "../db/schema";
import { db } from "./common/db";
import { httpGuarded } from "./common/httpGuarded";
import { login } from "./common/auth";

httpGuarded("register", async (req, res) => {
  const { userName, password } = parse(login, req.body);
  const bcryptPassword = hashSync(password, 12);
  const result = await db
    .insert(User)
    .values({ userName, bcrypt: bcryptPassword });
  res.send(result.insertId);
});
