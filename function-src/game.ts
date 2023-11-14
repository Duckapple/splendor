import { and, eq } from "drizzle-orm";
import { SplendorGame, SplendorGamePlayer } from "../db/schema";
import { AuthUser, ensureAuth } from "./common/auth";
import { db } from "./common/db";
import { Request, Response, httpGuarded } from "./common/httpGuarded";
import { randomUUID } from "crypto";

httpGuarded("game", async (req, res) => {
  const user = ensureAuth(req);
  switch (req.method) {
    case "POST":
      return post(user, res);
    case "GET":
      return get(user, req, res);
    default:
      return res.status(404).json({ message: "Not found" });
  }
});

async function post(user: AuthUser, res: Response) {
  const id = randomUUID();
  await db.insert(SplendorGame).values({ id });
  await db
    .insert(SplendorGamePlayer)
    .values({ gameId: id, userId: user.id, position: 0 });
  res.status(200).json({ message: "Game created!", data: { id } });
}

async function get(user: AuthUser, req: Request, res: Response) {
  const id = req.query.id;
  if (typeof id !== "string")
    return res.status(400).json({ message: "Bad game ID" });
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
    return res.status(404).json({ message: "Game not found" });
  res.status(200).json({ message: "Gotten!", data: result });
}
