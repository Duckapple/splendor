<script lang="ts">
	import Card from '$lib/game/Card.svelte';
	import { cardFromId } from '../../../../common/defaults';

	export let card = cardFromId(75);

	function getBoundingTiles(toCos: number, toSin: number) {
		const cos = Math.cos((Math.PI * 12) / 180) * toCos;
		const sin = Math.sin((Math.PI * 12) / 180) * toSin;
		return cos + sin;
	}

	let cardSize = (globalThis.window?.innerWidth ?? 0) < 768 ? [54, 86] : [189, 285];

	$: x = globalThis.window?.innerWidth
		? Math.ceil(getBoundingTiles(window.innerWidth, window.innerHeight) / cardSize[0])
		: 0;
	$: y = globalThis.window?.innerHeight
		? Math.ceil(getBoundingTiles(window.innerHeight, window.innerWidth) / cardSize[1])
		: 0;

	$: dX = globalThis.window?.innerWidth
		? Math.sin((Math.PI * 12) / 180) ** 2 * window.innerWidth
		: 0;
	$: dY = globalThis.window?.innerWidth
		? Math.sin((Math.PI * 12) / 180) * Math.cos((Math.PI * 12) / 180) * window.innerWidth
		: 0;

	globalThis.window?.addEventListener('resize', () => {
		cardSize = globalThis.window.innerWidth < 768 ? [54, 86] : [189, 285];
	});
</script>

<div class="fixed">
	<div
		class="absolute inset-0 z-20 w-screen bg-[radial-gradient(farthest-corner,_white,_lightgray)] opacity-50"
	/>
	<div
		class="flex flex-col h-screen gap-2 overflow-hidden origin-top-left md:gap-4 bg-slate-50"
		style="transform: translate({dX}px, -{dY}px) rotate(12deg) scale(1.5);"
	>
		{#each Array(y) as _}
			<div class="flex gap-2 md:gap-4">
				{#each Array(x) as _}
					<Card {card} />
				{/each}
			</div>
		{/each}
	</div>
</div>
