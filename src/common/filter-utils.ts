/**
 * Returns a function that asserts the `field` property is defined and not-null.
 * Useful for filtering based on some property, so you don't need to explicitly do the `(item): item is X & ...` TypeScript hint
 * @param field The name of the field to filter by.
 * @example
 * const x = [{ a: true }, { a: null }, { a: undefined }, {}].filter(assertField('a'));
 * //    x = [{ a: true }] satisfies { a: boolean }[];
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function assertField<Field extends string, T extends { [K in Field]?: unknown }>(
	field: Field
) {
	return (item: T): item is T & { [K in Field]: NonNullable<T[K]> } =>
		field in item && item[field] != null;
}

function assertNotNull<T>(item: T): item is NonNullable<T> {
	return item != null;
}

export function only(f: 'string'): (x: unknown) => x is string;
export function only(f: 'number'): (x: unknown) => x is number;
export function only(f: 'boolean'): (x: unknown) => x is boolean;
export function only(f: 'number' | 'string' | 'boolean'): (x: unknown) => boolean {
	return (x) => typeof x === f;
}
