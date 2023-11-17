import { eq } from "drizzle-orm";
import { SplendorGamePlayer, SplendorRoom, User } from "../db/schema";
import { ensureAuth } from "./common/auth";
import { db } from "./common/db";
import { Request, Response, httpGuarded } from "./common/httpGuarded";
import { randomUUID } from "crypto";
import { object, parse, string, uuid } from "valibot";
import { AuthUser } from "../common/communication";

httpGuarded("room", async (req, res) => {
  const user = ensureAuth(req);
  switch (req.method) {
    case "POST":
      return post(user, res);
    case "PUT":
      return put(user, req, res);
    case "GET":
      return get(user, req, res);
    default:
      return res
        .status(404)
        .header("Allow", "POST, PUT, GET")
        .json({ message: "Not found" });
  }
});

export async function post(user: AuthUser, res: Response) {
  const id = randomUUID();
  const inserts = [
    db.insert(SplendorRoom).values({ id, ownerId: user.id }),
    db
      .insert(SplendorGamePlayer)
      .values({ gameId: id, userId: user.id, position: 0 }),
  ];
  await Promise.all(inserts);
  res.status(200).json({ message: "Room created!", data: { id } });
}

const getInput = object({ id: string([uuid()]) });
export async function put(user: AuthUser, req: Request, res: Response) {
  const { id } = parse(getInput, req.query);

  const roomAndPlayers = await getGame(id);

  if (roomAndPlayers == null) {
    return res.status(404).json({ message: "Not Found" });
  }

  const players = roomAndPlayers.players;

  let message = "You're already in the room!";

  if (
    players.length < 4 &&
    players.every((player) => player.userId !== user.id)
  ) {
    const newPlayer = {
      gameId: id,
      userId: user.id,
      position: players.length,
      cards: [],
    };
    await db.insert(SplendorGamePlayer).values(newPlayer);
    players.push({
      userId: user.id,
      position: players.length,
      userName: user.userName,
    });
    message = "Joined the room!";
  }

  res.status(200).json({ message, data: roomAndPlayers });
}

async function get(user: AuthUser, req: Request, res: Response) {
  const { id } = parse(getInput, req.query);

  const data = await getGame(id);

  if (data == null) {
    return res.status(404).json({ message: "Not Found" });
  }

  if (data.players.every((player) => player.userId !== user.id)) {
    return res.status(404).json({ message: "Not Found" });
  }

  res.status(200).json({ message: "Found room", data });
}

export async function getGame(id: string) {
  const roomAndPlayers = await db
    .select({
      SplendorRoom,
      player: {
        userId: SplendorGamePlayer.userId,
        position: SplendorGamePlayer.position,
        userName: User.userName,
      },
    })
    .from(SplendorRoom)
    .leftJoin(
      SplendorGamePlayer,
      eq(SplendorGamePlayer.gameId, SplendorRoom.id)
    )
    .leftJoin(User, eq(User.id, SplendorGamePlayer.userId))
    .where(eq(SplendorRoom.id, id));

  if (roomAndPlayers.length === 0) return null;

  const players = roomAndPlayers
    .map(({ player }) => player)
    .filter((player) => player.userId != null);

  return { ...roomAndPlayers[0].SplendorRoom, players };
}
