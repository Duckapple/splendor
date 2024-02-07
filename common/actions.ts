import * as v from 'valibot';
import { BuyCard, Reserve, TakeTokens } from './model';
import type { Extends } from './utils';

const buyCard = v.object({
	type: v.literal('BUY_CARD'),
	data: v.object({
		row: v.union([v.literal('high'), v.literal('middle'), v.literal('low'), v.literal('reserve')]),
		i: v.number(),
		card: v.number(),
		tokens: v.array(v.number([v.minValue(0)]), [v.length(6)]) as v.ArraySchema<
			ReturnType<typeof v.number>,
			BuyCard['data']['tokens']
		>,
		person: v.optional(
			v.object({
				i: v.number([v.minValue(0), v.maxValue(4)]) as v.NumberSchema<0 | 1 | 2 | 3 | 4>,
				id: v.number(),
			})
		),
	}),
});

const takeTokens = v.object({
	type: v.literal('TAKE_TOKENS'),
	data: v.object({
		tokens: v.array(v.number(), [v.minLength(1), v.maxLength(3)]) as v.ArraySchema<
			ReturnType<typeof v.number>,
			TakeTokens['data']['tokens']
		>,
		returned: v.optional(
			v.array(v.number(), [v.minLength(1), v.maxLength(3)]) as v.ArraySchema<
				ReturnType<typeof v.number>,
				TakeTokens['data']['returned']
			>
		),
	}),
});

const reserve = v.object({
	type: v.literal('RESERVE'),
	data: v.object({
		row: v.union([v.literal('high'), v.literal('middle'), v.literal('low')]),
		i: v.number(),
		card: v.number(),
		returnToken: v.optional(v.number()),
	}),
});

// Type tests for asserting schemas match model
const value_1_r: Extends<Reserve, v.Output<typeof reserve>> = true;
const value_2_r: Extends<v.Output<typeof reserve>, Reserve> = true;
const value_1_t: Extends<TakeTokens, v.Output<typeof takeTokens>> = true;
const value_2_t: Extends<v.Output<typeof takeTokens>, TakeTokens> = true;
const value_1_b: Extends<BuyCard, v.Output<typeof buyCard>> = true;
const value_2_b: Extends<v.Output<typeof buyCard>, BuyCard> = true;

export const actionSchema = v.variant('type', [buyCard, takeTokens, reserve]);
