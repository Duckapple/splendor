import { getContext, hasContext, setContext } from 'svelte';

interface Runes {
	colorblind: boolean;
}

export function useRuneContext<T extends keyof Runes>(key: T, def?: Runes[T]): { value: Runes[T] } {
	if (hasContext(key)) {
		return getContext(key);
	}
	if (def === undefined) {
		throw new Error(`No context found for ${key}`);
	}
	const value = $state({ value: def });
	return setContext(key, value);
}
