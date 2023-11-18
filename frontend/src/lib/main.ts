import type { AuthUser } from '../../../common/communication';
import { writable, derived, get } from 'svelte/store';
const BASE_URL = 'https://europe-west3-organic-folder-403021.cloudfunctions.net';
// const BASE_URL = 'https://splendor-functions.simon-green.dev';
const BASE_HEADERS = {
	Accept: 'application/json',
	'Content-Type': 'application/json',
};

const TOKEN = 'token' as const;

const jwt = writable<AuthUser | null>(
	JSON.parse(globalThis.localStorage?.getItem(TOKEN) ?? 'null')
);

export const isLoggedIn = derived(jwt, Boolean);

jwt.subscribe((jwt) => {
	globalThis.localStorage?.setItem(TOKEN, JSON.stringify(jwt));
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

export type AuthInput = {
	route: string;
	method: string;
	params?: Record<string, string>;
	body?: Record<string, unknown>;
};

export async function authed({ route, method = 'POST', params, body }: AuthInput) {
	const endpoint = BASE_URL + route + '?' + new URLSearchParams(params);
	const data = await fetch(endpoint, {
		headers: { ...BASE_HEADERS, Authorization: `Bearer ${get(jwt)}` },
		body: body ? JSON.stringify(body) : undefined,
		method,
	});

	if (data.status !== 200) {
		const error = await data.json();
		console.error(error);
		throw error;
	}

	return await data.json();
}
