export function shuffled<T>(sourceArr: T[]): T[] {
	const arr = [...sourceArr];
	for (let i = 0; i < arr.length; i++) {
		const arrI = arr[i];
		const i2 = Math.round(Math.random() * (arr.length - 1));
		arr[i] = arr[i2];
		arr[i2] = arrI;
	}
	return arr;
}

export function range(i: number, j?: number) {
	let x = 0;
	if (j !== undefined) {
		x = i;
		i = j;
	}
	return Array(i - x)
		.fill(0)
		.map(() => x++);
}

export function sum<T extends number>(numbers: T[]) {
	let i = 0;
	for (const x of numbers) {
		i += x;
	}
	return i;
}

export function pick<T extends object, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
	const res: Pick<T, K> = {} as Pick<T, K>;
	for (const key of keys) {
		res[key] = obj[key];
	}
	return res;
}

export function omit<T extends object, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> {
	for (const key of keys) {
		delete obj[key];
	}
	return obj;
}

export function mapValues<T extends object, U, K extends (string | number) & keyof T>(
	t: T,
	f: (t: T[K]) => U
): { [X in K]: U } {
	return Object.fromEntries(Object.entries(t).map(([k, v]) => [k, f(v)])) as never;
}

export type Extends<T1, T2> = T1 extends T2 ? true : false;

const dict = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function encodeBase58(n: number, minWidth = 8) {
	let res = '';
	while (n > 0) {
		res = dict[n % 58] + res;
		n = Math.floor(n / 58);
	}
	while (res.length <= minWidth) {
		res = '1' + res;
	}
	return res;
}
