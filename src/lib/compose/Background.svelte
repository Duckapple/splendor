<script lang="ts">
	import Card from '$lib/game/Card.svelte';
	import { onMount } from 'svelte';
	import { cardFromId } from '$common/defaults';

	let { card = cardFromId(75), small = false, class: cn = '' } = $props();

	function getBoundingTiles(toCos: number, toSin: number) {
		const cos = Math.cos((Math.PI * 12) / 180) * toCos;
		const sin = Math.sin((Math.PI * 12) / 180) * toSin;
		return cos + sin;
	}

	let cardSize = $state(
		(globalThis.window?.innerWidth ?? 0) < 768 || small ? [54, 86] : [189, 285]
	);

	let x = $derived(
		globalThis.window?.innerWidth
			? Math.ceil(getBoundingTiles(window.innerWidth, window.innerHeight) / cardSize[0])
			: 0
	);
	let y = $derived(
		globalThis.window?.innerHeight
			? Math.ceil(getBoundingTiles(window.innerHeight, window.innerWidth) / cardSize[1])
			: 0
	);

	let dX = $derived(
		globalThis.window?.innerWidth ? Math.sin((Math.PI * 12) / 180) ** 2 * window.innerWidth : 0
	);
	let dY = $derived(
		globalThis.window?.innerWidth
			? Math.sin((Math.PI * 12) / 180) * Math.cos((Math.PI * 12) / 180) * window.innerWidth
			: 0
	);

	onMount(() => {
		const cb = () => {
			cardSize = globalThis.window.innerWidth < 768 || small ? [54, 86] : [189, 285];
		};
		if (globalThis.window) {
			window.addEventListener('resize', cb);
			return () => window.removeEventListener('resize', cb);
		}
	});
</script>

<div class="fixed">
	<div
		class={[
			'absolute inset-0 z-20 w-screen bg-[radial-gradient(farthest-corner,_white,_lightgray)] opacity-50',
			cn,
		]}
	></div>
	<div
		class={[
			'flex flex-col h-screen gap-2 overflow-hidden origin-top-left bg-slate-50',
			!small && 'md:gap-4',
		]}
		style="transform: translate({dX}px, -{dY}px) rotate(12deg) scale(1.5);"
	>
		{#each Array(y) as _}
			<div class={['flex gap-2', !small && 'md:gap-4']}>
				{#each Array(x) as _}
					<Card {card} {small} />
				{/each}
			</div>
		{/each}
	</div>
</div>
