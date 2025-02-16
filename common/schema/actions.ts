import { t } from 'elysia';

type SixTuple<T> = [T, T, T, T, T, T];

const sixTupleType = t.Tuple<SixTuple<ReturnType<typeof t.Number>>>([] as never);
const sixTuple = t.Array(t.Number({ minimum: 0 }), {
	minItems: 6,
	maxItems: 6,
}) as unknown as typeof sixTupleType;

const buyCard = t.Object({
	type: t.Literal('BUY_CARD'),
	data: t.Object({
		row: t.UnionEnum(['high', 'middle', 'low', 'reserve']),
		i: t.Number(),
		card: t.Number(),
		tokens: sixTuple,
		person: t.Optional(
			t.Object({
				id: t.Number(),
			})
		),
	}),
});

const tokensType = t.Union([
	t.Tuple([t.Number(), t.Number(), t.Number()]),
	t.Tuple([t.Number(), t.Number()]),
	t.Tuple([t.Number()]),
]);
const tokens = t.Array(t.Number(), { minItems: 1, maxItems: 3 }) as unknown as typeof tokensType;

const takeTokens = t.Object({
	type: t.Literal('TAKE_TOKENS'),
	data: t.Object({
		tokens: tokens,
		returned: t.Optional(tokens),
	}),
});

const reserve = t.Object({
	type: t.Literal('RESERVE'),
	data: t.Object({
		row: t.UnionEnum(['high', 'middle', 'low']),
		i: t.Number(),
		card: t.Number(),
		returnToken: t.Optional(t.Number()),
	}),
});

// Type tests for asserting schemas match model

export const actionSchema = t.Union([buyCard, takeTokens, reserve]);
