import type { NONE, Routes } from '../../../common/communication';
import { writable, derived, get, type Writable } from 'svelte/store';

const BASE_URL = 'https://europe-west3-organic-folder-403021.cloudfunctions.net';

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

const jwt = cachedWritable<string>(TOKEN);

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

	jwt.set((await data.json()).data.jwt);
}

export function logout() {
	jwt.set(null);
}

export type AuthInput<
	Route extends keyof Routes,
	Method extends keyof Routes[Route],
	// @ts-expect-error ts(2344) It don't know NONE, but works
	Params extends keyof Routes[Route][Method] = NONE
> = {
	route: Route;
	method: Method;
	params?: Params extends NONE ? undefined : Record<Params | (string & {}), string>;
	body?: Record<string, unknown>;
};

type Result<T> = {
	message: string;
	data: T;
};

export async function authed<
	Route extends keyof Routes,
	Method extends keyof Routes[Route],
	// @ts-expect-error ts(2344) It don't know NONE, but works
	Params extends keyof Routes[Route][Method] = NONE
>({
	route,
	method,
	params,
	body,
}: AuthInput<Route, Method, Params>): Promise<Result<Routes[Route][Method][Params]>> {
	const auth = get(jwt);
	if (auth === null) throw { message: 'Unauthorized' };

	const endpoint = BASE_URL + route + '?' + new URLSearchParams(params);
	const data = await fetch(endpoint, {
		headers: { ...BASE_HEADERS, Authorization: `Bearer ${auth}` },
		body: body ? JSON.stringify(body) : undefined,
		// @ts-expect-error ts(2769) It doesn't understand the method is a `string`
		method,
	});

	if (data.status !== 200) {
		const error = await data.json();
		console.error(error);
		throw error;
	}

	return await data.json();
}
