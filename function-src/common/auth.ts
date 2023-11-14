import type { Request } from "@google-cloud/functions-framework";
import JWT from "jsonwebtoken";
import { maxLength, minLength, object, string } from "valibot";

export class AuthError extends Error {
  data: string | undefined;
  constructor(data?: string) {
    super("Unauthorized");
    this.data = data;
  }
}

export const login = object({
  userName: string("User name should be a string", [
    maxLength(64, "User name has to be less than 64 characters"),
    minLength(2, "User name has to be 2 characters long"),
  ]),
  password: string("Password should be a string", [
    maxLength(128, "Password has to be less than 128 characters"),
    minLength(8, "Password should be more than 8 characters long"),
  ]),
});

if (process.env.JWT_SECRET == null) throw new Error("JWT_SECRET undefined");

const secret = process.env.JWT_SECRET;

type Result = {
  id: string;
  userName: string;
  iat: number;
};

export function ensureAuth(req: Request): Result {
  const authHeader = req.headers.authorization;
  if (authHeader == null) throw new AuthError();

  const [_bearer, jwt] = authHeader.split(" ");
  if (jwt == null) throw new AuthError();

  try {
    const payload = JWT.verify(jwt, secret, {
      algorithms: ["HS512"],
    });
    return payload as Result;
  } catch (e) {
    throw new AuthError("Invalid JWT Token");
  }
}

export function makeJwt(user: { userName: string; id: string }) {
  return JWT.sign(user, secret, { algorithm: "HS512" });
}
