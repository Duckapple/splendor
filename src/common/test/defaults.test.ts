import { expect, test } from 'bun:test';
import { newGameState, positionFromCardId } from '../defaults';

test('positionFromCardId gets positions', () => {
	const game = newGameState('1234', 4);

	expect(positionFromCardId(game.shown, game.shown.high[2])).toEqual(['high', 2] as const);
	expect(positionFromCardId(game.shown, game.shown.low[1])).toEqual(['low', 1] as const);
	expect(positionFromCardId(game.shown, game.shown.middle[0])).toEqual(['middle', 0] as const);
	expect(positionFromCardId(game.shown, game.shown.persons[4])).toEqual(['persons', 4] as const);
});
