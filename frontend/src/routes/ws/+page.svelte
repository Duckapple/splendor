<script lang="ts">
	import Button from '$lib/base/Button.svelte';
	import { TOKEN } from '$lib/main';
	import { useLocalStoreRune } from '$lib/state/local-store-rune.svelte';
	import { getWebSocket } from '$lib/web-socket.svelte';

	const ws = getWebSocket();

	let messages = $state<any[]>([]);

	ws?.subscribe(({ data }) => {
		messages.push(data);
	});

	const jwt = useLocalStoreRune<string>(TOKEN);
</script>

<div class="fixed inset-0 bg-slate-950 text-white p-8">
	{#if jwt.value}
		<Button onClick={() => ws?.send({ type: 'register', token: jwt.value! })}>Connect</Button>
		<Button onClick={() => ws?.send({ type: 'repeat', message: 'heyo' })}>Repeat</Button>
		<ul>
			{#each messages as message}
				<li>{JSON.stringify(message)}</li>
			{/each}
		</ul>
	{/if}
</div>
