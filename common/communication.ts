import type { SplendorAction, SplendorGamePlayer, SplendorGame, SplendorRoom } from '../db/schema';
import type { GameState } from './model';
export type AuthUser = {
	id: string;
	userName: string;
	iat: number;
};

const NONE = Symbol();

export type NONE = typeof NONE;

type RoomAndPlayers = SplendorRoom & {
	players: {
		userId: string;
		position: number;
		userName: string;
	}[];
};

export type Routes = {
	'/room': {
		GET: {
			[NONE]: RoomAndPlayers[];
			id: RoomAndPlayers | null;
		};
		PUT: { id: RoomAndPlayers | null };
		POST: { id: RoomAndPlayers | null };
	};
	'/game': {
		POST: { id: GameState };
		GET: {
			id: { game: Omit<SplendorGame, 'piles'>; player: SplendorGamePlayer }[];
		};
	};
	'/action': {
		GET: {
			gameId: SplendorAction[];
		};
		POST: {
			gameId: {
				game: Omit<SplendorGame, 'piles'>;
				player: SplendorGamePlayer;
				action: SplendorAction;
			};
		};
	};
};
