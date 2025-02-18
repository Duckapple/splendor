<script lang="ts">
	import Coin from '$lib/game/Coin.svelte';
	import type { Color } from '../../../../common/model';
	import { range } from '../../../../common/utils';

	interface Props {
		initialCoinColor: Color | null;
		holdTokens?: number[];
		tokens: number[];
		error?: string;
		tryTake: (color: Color) => void;
		center?: HTMLDivElement;
	}
	let {
		tokens = $bindable(),
		center = $bindable(),
		error = $bindable(),
		holdTokens,
		initialCoinColor,
		tryTake,
	}: Props = $props();

	let takenOfEach = $derived(
		range(6).map((color) => tokens.filter((token) => token === color).length)
	);
	let leftOverOfEach = $derived((holdTokens ?? []).map((count, i) => count - takenOfEach[i]));
</script>

<div class="flex flex-col-reverse gap-4 pt-4 pb-2 md:pt-6 md:gap-8">
	<div class="relative flex gap-1.5 md:gap-4">
		<div
			class="absolute size-10 md:size-24 flex justify-center items-center"
			style="left: calc({initialCoinColor ?? 0} * var(--coin-with-gap))"
		>
			<div bind:this={center}></div>
		</div>
		{#each leftOverOfEach ?? [] as stackSize, color}
			<Coin {color} {stackSize} onclick={() => stackSize > 0 && tryTake(color)} />
		{/each}
	</div>
	<div class="relative flex gap-1.5 md:gap-4">
		{#each takenOfEach as stackSize, color}
			<Coin
				{color}
				{stackSize}
				onclick={() => {
					error = '';
					if (tokens.indexOf(color) !== -1) tokens = tokens.toSpliced(tokens.indexOf(color), 1);
				}}
			/>
		{/each}
	</div>
</div>
