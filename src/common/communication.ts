import type { SplendorGamePlayer, SplendorGame } from '../db/schema';
export type AuthUser = {
	id: string;
	userName: string;
};

const NONE = Symbol();

export type NONE = typeof NONE;

export type GameAndPlayers = SplendorGame & {
	players: (SplendorGamePlayer & { userName: string })[];
};

export type Routes = {};
