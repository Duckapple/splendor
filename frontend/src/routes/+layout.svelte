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

<div class="flex flex-col min-h-screen">
	<Header />

	<main class="box-border flex flex-col flex-1 w-full max-w-5xl p-4 mx-auto">
		<QueryClientProvider client={queryClient}>
			<slot />
		</QueryClientProvider>
	</main>

	<footer class="flex flex-col items-center justify-center p-3 min-[480px]:px-0">
		<p>
			visit <a class="font-bold" href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit
		</p>
	</footer>
</div>
