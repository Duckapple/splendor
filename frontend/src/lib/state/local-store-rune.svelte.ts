import { browser } from '$app/environment';

export function useLocalStoreRune<T>(key: string): { value: T | null } {
	const state = $state<{ value: T | null }>({ value: null });

	if (browser) {
		const data = localStorage.getItem(key);
		if (data != null) {
			state.value = JSON.parse(data);
		}
	}

	return {
		get value() {
			return state.value;
		},
		set value(value: T | null) {
			state.value = value;
			if (value == null) {
				localStorage.removeItem(key);
			} else {
				localStorage.setItem(key, JSON.stringify(value));
			}
		},
	};
}
