import type { AuthUser } from '../../../common/communication';
import { writable, derived } from 'svelte/store';
const BASE_URL = 'https://europe-west3-organic-folder-403021.cloudfunctions.net';
// const BASE_URL = 'https://splendor-functions.simon-green.dev';
const BASE_HEADERS = {
	Accept: 'application/json',
	'Content-Type': 'application/json',
};

if (!('localStorage' in globalThis)) {
	// prettier-ignore
	globalThis.localStorage = {
    clear() {},
    getItem(key) { return null; },
    setItem(key, value) {},
    key(index) { return null; },
    removeItem(key) {},
    length: 0,
  }
}

const TOKEN = 'token' as const;

const jwt = writable<AuthUser | null>(JSON.parse(localStorage.getItem(TOKEN) ?? 'null'));

export const isLoggedIn = derived(jwt, Boolean);

jwt.subscribe((jwt) => {
	localStorage.setItem(TOKEN, JSON.stringify(jwt));
});

export async function login(userName: string, password: string) {
	const data = await fetch(BASE_URL + '/log-in', {
		headers: BASE_HEADERS,
		body: JSON.stringify({ userName, password }),
		method: 'POST',
	});

	if (data.status !== 200) {
		const error = await data.json();
		throw error;
	}

	jwt.set((await data.json()).jwt);
}

export function logout() {
	jwt.set(null);
}
