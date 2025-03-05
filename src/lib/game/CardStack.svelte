<script lang="ts">
	interface Props {
		tier: 'low' | 'middle' | 'high';
		count?: number;
	}

	let { tier, count = 0 }: Props = $props();

	let stackSize = $derived(Math.min(3, count));
</script>

<div class="w-14 h-[5.5rem] md:w-32 md:h-48 select-none group">
	{#each Array(stackSize) as _, i}
		<div
			class="w-14 h-[5.5rem] md:w-32 md:h-48 last:mb-0 -mb-[5.75rem] md:-mb-[12.5rem] rounded-lg border border-black p-1 md:p-2 bg-white group-hover:last:-translate-y-2 transition-transform"
		>
			<div
				class="flex items-end justify-end w-full h-full px-1 text-2xl text-white md:py-1 md:px-2 md:text-4xl card-pattern"
				class:bg-cyan-800={tier === 'high'}
				class:bg-amber-800={tier === 'middle'}
				class:bg-green-800={tier === 'low'}
			>
				{#if i + 1 === stackSize}
					{count}
				{/if}
			</div>
		</div>
	{/each}
</div>
