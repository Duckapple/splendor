import { and, eq } from "drizzle-orm";
import { SplendorGame, SplendorGamePlayer } from "../db/schema";
import { ensureAuth } from "./common/auth";
import { db } from "./common/db";
import {
  FunctionError,
  Request,
  Response,
  authedHandler,
  httpGuarded,
} from "./common/httpGuarded";
import { randomUUID } from "crypto";
import { AuthUser } from "../common/communication";

httpGuarded("game", {
  POST: authedHandler(post),
  GET: authedHandler(get),
});

async function post(user: AuthUser) {
  const id = randomUUID();
  await db.insert(SplendorGame).values({ id });
  await db
    .insert(SplendorGamePlayer)
    .values({ gameId: id, userId: user.id, position: 0 });
  return { message: "Game created!", data: { id } };
}

async function get(user: AuthUser, req: Request) {
  const id = req.query.id;
  if (typeof id !== "string")
    throw new FunctionError(400, { message: "Bad game ID" });
  const [result] = await db
    .select()
    .from(SplendorGame)
    .innerJoin(
      SplendorGamePlayer,
      eq(SplendorGamePlayer.gameId, SplendorGame.id)
    )
    .where(
      and(eq(SplendorGame.id, id), eq(SplendorGamePlayer.userId, user.id))
    );
  if (result == null)
    throw new FunctionError(404, { message: "Game not found" });
  return { message: "Gotten!", data: result };
}
