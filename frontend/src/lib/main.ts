import { writable, derived, get, type Writable } from 'svelte/store';
import { treaty } from '@elysiajs/eden';
import type { App } from '../../../local';

export const BASE_URL = import.meta.env.DEV
	? 'http://localhost:5173'
	: 'https://splendor.simon-green.dev';

export const client = treaty<App>(BASE_URL, {
	headers() {
		return { Authorization: `Bearer ${get(jwt)}` };
	},
});

const BASE_HEADERS = {
	Accept: 'application/json',
	'Content-Type': 'application/json',
};

export function cachedWritable<T>(key: string): Writable<T | null>;
export function cachedWritable<T>(key: string, defaultValue: T): Writable<T>;
export function cachedWritable<T>(key: string, defaultValue?: T) {
	const def = defaultValue ?? null;
	const w = writable(JSON.parse(globalThis.localStorage?.getItem(key) ?? 'null') ?? def);
	w.subscribe((data) => globalThis.localStorage?.setItem(key, JSON.stringify(data ?? def)));
	return w;
}

const TOKEN = 'token' as const;

export const jwt = cachedWritable<string>(TOKEN);

export const isLoggedIn = derived(jwt, Boolean);

export const user = derived(jwt, (jwt) => {
	const [, data] = jwt?.split('.') ?? [];
	if (data == null) return null;
	try {
		const { userName, id } = JSON.parse(atob(data));
		if (userName == null || id == null) return null;
		return { userName, id };
	} catch (e) {
		return null;
	}
});

export const userNames = cachedWritable<Record<string, string>>('user-name-cache', {});

type LoginInput = Record<'userName' | 'password', string>;
export async function loginRegister(input: LoginInput, isRegister = false) {
	const endpoint = isRegister ? '/register' : '/log-in';
	const data = await fetch(BASE_URL + endpoint, {
		headers: BASE_HEADERS,
		body: JSON.stringify(input),
		method: 'POST',
	});

	if (data.status !== 200) {
		const error = await data.json();
		throw error;
	}

	const newJwt = (await data.json()).jwt;
	jwt.set(newJwt);

	return newJwt;
}

export function logout() {
	jwt.set(null);
}
