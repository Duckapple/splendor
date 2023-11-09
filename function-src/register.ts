import { maxLength, minLength, object, parse, string } from "valibot";
import bcrypt from "bcrypt";
import { User } from "../db/schema";
import { db } from "./common/db";
import { httpGuarded } from "./common/httpGuarded";

export const input = object({
  userName: string("User name should be a string", [
    maxLength(64, "User name has to be less than 64 characters"),
    minLength(2, "User name has to be 2 characters long"),
  ]),
  password: string("Password should be a string", [
    maxLength(128, "Password has to be less than 128 characters"),
    minLength(8, "Password should be more than 8 characters long"),
  ]),
});

httpGuarded("register", async (req, res) => {
  const { userName, password } = parse(input, req.body);
  const bcryptPassword = bcrypt.hashSync(password, 12);
  const result = await db
    .insert(User)
    .values({ userName, bcrypt: bcryptPassword });
  res.send(result.insertId);
});
