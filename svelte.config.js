import adapter from 'svelte-adapter-bun';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			fallback: '404.html',
		}),
		alias: {
			$backend: 'src/backend',
			$common: 'src/common',
			$db: 'src/db',
		},
		files: {
			serviceWorker: 'src/service-worker',
		},
	},
};

export default config;
