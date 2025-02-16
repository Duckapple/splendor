import { QueryClient } from '@tanstack/svelte-query';
import type { Treaty } from '@elysiajs/eden';
import type { GameAndPlayers } from '../../../../common/communication';
import type { StateUpdate } from '../../../../common/schema/game';

type PartialRes<T> = Omit<Treaty.TreatyResponse<{ 200: T }>, 'headers' | 'response'>;

type TreatyGame = PartialRes<GameAndPlayers>;

export function useUpdateGameState(queryClient: QueryClient) {
	function updateGameState(gameId: string, actionResult: PartialRes<StateUpdate[string]>) {
		const newData = actionResult.data;
		if (!newData) return;

		queryclient.setQueryData<TreatyGame>(['game', gameId], (prev?: TreatyGame) => {
			const players = structuredClone(prev?.data?.players ?? []);
			const index = players.findIndex(({ userId }) => userId === newData.player.userId);
			players[index] = { ...newData.player, userName: players[index].userName };

			return {
				...prev,
				...actionResult,
				data: {
					...prev?.data,
					...newData.game,
					players,
				},
			};
		});
	}

	return { updateGameState };
}
