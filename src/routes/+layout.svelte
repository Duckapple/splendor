<script lang="ts">
	import '../app.css';
	import '$lib/main';

	import { QueryClientProvider } from '@tanstack/svelte-query';
	import type { Snippet } from 'svelte';
	import { browser } from '$app/environment';

	import { useRuneContext } from '$lib/state/context-rune.svelte';
	import { useLocalStoreRune } from '$lib/state/local-store-rune.svelte';
	import { TOKEN } from '$lib/main';
	import { getWebSocket } from '$lib/web-socket.svelte';

	import type { LayoutData } from './$types';

	interface Props {
		data: LayoutData;
		children?: Snippet;
	}

	let { children, data }: Props = $props();

	const colorblind = useRuneContext(
		'colorblind',
		browser && localStorage.getItem('colorblind') === 'true'
	);
	$effect(() => {
		if (browser) {
			localStorage.setItem('colorblind', colorblind.value.toString());
		}
	});

	const ws = getWebSocket();
	const jwt = useLocalStoreRune<string>(TOKEN);

	$effect(() => {
		if (jwt.value && ws) {
			setTimeout(() => ws.send({ type: 'register', token: jwt.value! }), 200);
		}
	});
</script>

<main class="box-border flex flex-col flex-1 w-full min-h-screen mx-auto">
	<QueryClientProvider client={data.queryClient}>
		{@render children?.()}
	</QueryClientProvider>
</main>
