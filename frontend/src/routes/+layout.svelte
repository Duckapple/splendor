<script lang="ts">
	import './styles.css';
	import '../app.css';
	import '$lib/main';
	import { browser } from '$app/environment';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import type { Snippet } from 'svelte';
	import { useRuneContext } from '$lib/state/contextRune.svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
			},
		},
	});

	useRuneContext('colorblind', false);
</script>

<main class="box-border flex flex-col flex-1 w-full min-h-screen mx-auto">
	<QueryClientProvider client={queryClient}>
		{@render children?.()}
	</QueryClientProvider>
</main>
