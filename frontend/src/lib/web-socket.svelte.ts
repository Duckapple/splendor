import { getContext, hasContext, setContext } from 'svelte';
import { treaty } from '@elysiajs/eden';
import type { WSApp } from '../../../wss';
import { PUBLIC_WS_PORT } from '$env/static/public';
import { browser } from '$app/environment';

const WS_URL = import.meta.env.DEV ? `localhost:${PUBLIC_WS_PORT}` : 'api-splendor.simon-green.dev';

const client = treaty<WSApp>(WS_URL);

export function getWebSocket() {
	if (!browser) return;
	if (hasContext('websocket')) {
		return getContext<ReturnType<typeof client.ws.subscribe>>('websocket');
	}
	const ws = client.ws.subscribe();

	ws.on('close', () => console.error('closed'));

	return setContext('websocket', ws);
}
