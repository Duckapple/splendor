// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

declare interface String {
	startsWith<T extends string>(searchString: T): this is `${T}${string}`;
	includes<T extends string>(searchString: T): this is `${string}${T}${string}`;
}

export {};
