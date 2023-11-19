import { and, eq } from "drizzle-orm";
import {
  SplendorGame,
  SplendorGamePlayer,
  SplendorRoom as Room,
  SplendorGameSelect,
} from "../db/schema";
import { db } from "./common/db";
import {
  FunctionError,
  Request,
  authedHandler,
  httpGuarded,
} from "./common/httpGuarded";
import { AuthUser } from "../common/communication";
import { newGameState } from "../common/defaults";

httpGuarded("game", {
  POST: authedHandler(post),
  GET: authedHandler(get),
});

async function post(user: AuthUser, req: Request) {
  const id = req.query.id;
  if (typeof id !== "string")
    throw new FunctionError(400, { message: "Bad room ID" });

  const [room, ...rest] = await db
    .select()
    .from(Room)
    .leftJoin(SplendorGamePlayer, eq(Room.id, SplendorGamePlayer.gameId))
    .where(
      and(eq(Room.id, id), eq(Room.ownerId, user.id), eq(Room.started, false))
    );

  if (room == null) throw new FunctionError(400, { message: "Bad Request" });

  const game = newGameState(id, rest.length + 1);

  await Promise.all([
    db.insert(SplendorGame).values(game),
    db.update(Room).set({ started: true }).where(eq(Room.id, id)),
  ]);

  return { message: "Game created!", data: game };
}

async function get(user: AuthUser, req: Request) {
  const id = req.query.id;
  if (typeof id !== "string")
    throw new FunctionError(400, { message: "Bad game ID" });

  const result = await db
    .select({ game: SplendorGameSelect, player: SplendorGamePlayer })
    .from(SplendorGame)
    .innerJoin(
      SplendorGamePlayer,
      eq(SplendorGamePlayer.gameId, SplendorGame.id)
    )
    .where(eq(SplendorGame.id, id));

  if (result.length === 0)
    throw new FunctionError(404, { message: "Game not found" });

  if (!result.some(({ player }) => player?.userId === user.id))
    throw new FunctionError(403, { message: "Forbidden" });

  return { message: "Gotten!", data: result };
}