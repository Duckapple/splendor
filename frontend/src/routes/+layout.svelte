<script>
	import Header from './Header.svelte';
	import './styles.css';
	import '../app.css';
	import '$lib/main';
	import { browser } from '$app/environment';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
			},
		},
	});
</script>

<main class="box-border flex flex-col flex-1 w-full max-w-5xl min-h-screen p-4 mx-auto">
	<QueryClientProvider client={queryClient}>
		<slot />
	</QueryClientProvider>
</main>
