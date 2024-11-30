import type { Request, Response } from "@google-cloud/functions-framework";
import JWT from "jsonwebtoken";
import { maxLength, minLength, object, string } from "valibot";
import { AuthUser } from "../../common/communication";

export class AuthError extends Error {
  data: string | undefined;
  constructor(data?: string) {
    super("Unauthorized");
    this.data = data;
  }
}

export function withHeaders(
  res: Response,
  methods: ("POST" | "GET" | "OPTIONS" | "PUT" | "DELETE" | "PATCH")[]
) {
  const headers: [string, string][] = [
    ["Allow", methods.join(", ")],
    ["Accept", "application/json"],
    ["Access-Control-Allow-Origin", "*"],
    ["Access-Control-Allow-Headers", "Content-Type, Accept, Authorization"],
    ["Access-Control-Max-Age", "86400"],
  ];
  return headers.reduce((res, hdr) => res.header(...hdr), res);
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

export function ensureAuth(req: Request): AuthUser {
  const authHeader = req.headers.authorization;
  if (authHeader == null) throw new AuthError();

  const [_bearer, jwt] = authHeader.split(" ");
  if (jwt == null) throw new AuthError();

  try {
    const payload = JWT.verify(jwt, secret, {
      algorithms: ["HS512"],
    });
    return payload as AuthUser;
  } catch (e) {
    throw new AuthError("Invalid JWT Token");
  }
}

export function makeJwt(user: { userName: string; id: string }) {
  return JWT.sign(user, secret, { algorithm: "HS512" });
}
