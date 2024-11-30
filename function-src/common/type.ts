import type { Static, t } from 'elysia';

export type Infer<T extends Record<string, ReturnType<typeof t.Object>>> = {
	[K in keyof T]: Static<T[K]>;
};
