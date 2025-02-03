import { QueryClient } from '@tanstack/svelte-query';
import type { Action, GameState } from '../../../../common/model';
import type { Treaty } from '@elysiajs/eden';
import type { GameAndPlayers } from '../../../../common/communication';
import type { SplendorGamePlayer } from '../../../../db/schema';

type TreatyGame = Treaty.TreatyResponse<{ 200: GameAndPlayers }>;

export function useUpdateGameState(queryClient: QueryClient) {
	function updateGameState(
		gameId: string,
		actionResult: Treaty.TreatyResponse<{
			200: { game: GameState; player: SplendorGamePlayer; action: Action };
		}>
	) {
		if (!actionResult.data) return;

		queryClient.setQueryData<TreatyGame>(['game', gameId], (prev?: TreatyGame) => {
			const players = structuredClone(prev?.data?.players ?? []);
			const index = players.findIndex(({ userId }) => userId === actionResult.data.player.userId);
			players[index] = { ...actionResult.data.player, userName: players[index].userName };

			return {
				...actionResult,
				data: {
					...prev?.data,
					...actionResult.data.game,
					players,
				},
			};
		});
	}

	return { updateGameState };
}
