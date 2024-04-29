<script lang="ts">
	import Coin from '$lib/game/Coin.svelte';
	import { user } from '$lib/main';
	import type { SplendorGamePlayer } from '../../../../db/schema';

	export let player: SplendorGamePlayer & { userName: string };
	export let turn: number | undefined;

	const isUser = $user?.id === player.userId;
</script>

<div class="p-2 border rounded">
	<h1>
		'<span class:underline={isUser}>{player.userName}</span>'{turn === player.position
			? ' - current player'
			: ''}
	</h1>
	<div class="flex gap-2">
		{#each player.tokens as stackSize, color}
			<Coin small {stackSize} {color} />
		{/each}
	</div>
	<pre>{JSON.stringify({ ...player, tokens: undefined, userName: undefined }, null, 2)}</pre>
</div>
