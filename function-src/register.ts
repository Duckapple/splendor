import { parse } from "valibot";
import { hashSync } from "bcrypt";
import { randomUUID } from "crypto";
import { User } from "../db/schema";
import { db } from "./common/db";
import { httpGuarded } from "./common/httpGuarded";
import { login, makeJwt } from "./common/auth";

httpGuarded("register", {
  POST: async (req) => {
    const id = randomUUID();
    const { userName, password } = parse(login, req.body);
    const bcryptPassword = hashSync(password, 12);
    const insert = db
      .insert(User)
      .values({ id, userName, bcrypt: bcryptPassword });

    const jwt = makeJwt({ id, userName });
    await insert;
    return { jwt, message: "Registered successfully!", status: "success" };
  },
});
