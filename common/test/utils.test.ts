import { expect, test } from 'bun:test';
import { mapValues } from '../utils';

test('mapValues maps values, leaving keys', () => {
	const symbol = Symbol();
	const input = {
		[symbol]: [],
		[0]: [1, 2, 3],
		'a string': [1, 2, 3, 4],
	};
	const piles = mapValues(input, ({ length }) => ({ length }));

	expect(piles).toEqual({
		[0]: { length: 3 },
		'a string': { length: 4 },
	});
});
