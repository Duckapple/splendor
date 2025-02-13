<script lang="ts">
	import { run } from 'svelte/legacy';

	import { textColorOf } from '$lib/color';
	import { Spring } from 'svelte/motion';
	import type { Color } from '../../../common/model';

	interface Props {
		color: Color;
		min?: number;
		value?: number;
		max?: number;
		invalid?: boolean;
		noButtons?: boolean;
		decrement?: any;
		increment?: any;
	}

	let {
		color,
		min = 0,
		value = 0,
		max = 5,
		invalid = false,
		noButtons = false,
		decrement = (color: Color) => {},
		increment = (color: Color) => {},
	}: Props = $props();

	const displayed_count = Spring.of(() => value);

	function modulo(n: number, m: number) {
		// handle negative numbers
		return ((n % m) + m) % m;
	}
	run(() => {
		displayed_count.set(value);
	});
	let offset = $derived(modulo(displayed_count.current, 1));
</script>

<div
	class="flex flex-col my-4 rounded-t-md md:rounded-t-xl rounded-b-md md:rounded-b-xl"
	class:shadow={!noButtons}
>
	{#if !noButtons}
		<button
			class="flex items-center justify-center h-6 p-0 bg-transparent border-0 md:h-8 rounded-t-md md:rounded-t-xl touch-manipulation"
			class:cursor-not-allowed={value >= max}
			class:hover:bg-slate-200={value < max}
			onclick={() => value < max && increment(color)}
			aria-label="Increase the counter by one"
		>
			<svg aria-hidden="true" viewBox="0 0 1 1" class="w-1/2 h-1/2">
				<path
					class="[vector-effect:non-scaling-stroke] stroke-2"
					class:stroke-zinc-700={value < max}
					class:stroke-zinc-400={value >= max}
					d="M0,0.5 L1,0.5 M0.5,0 L0.5,1"
				/>
			</svg>
		</button>
	{:else}
		<div class="h-6 md:h-8"></div>
	{/if}

	<div
		class={'w-8 h-12 md:w-14 md:h-16 overflow-hidden text-center relative cursor-default border-red-500 ' +
			textColorOf[color]}
		class:text-opacity-60={value === 0}
		class:border-b-2={invalid}
	>
		<div
			class="absolute inset-0 text-5xl font-normal md:text-7xl"
			style="transform: translate(0, {100 * offset}%)"
		>
			<span
				class="absolute flex items-center justify-center w-full h-full select-none -top-full"
				aria-hidden="true">{Math.floor(displayed_count.current + 1)}</span
			>
			<span class="absolute flex items-center justify-center w-full h-full"
				>{Math.floor(displayed_count.current)}</span
			>
		</div>
	</div>

	{#if !noButtons}
		<button
			class="flex items-center justify-center h-6 p-0 bg-transparent border-0 md:h-8 rounded-b-md md:rounded-b-xl touch-manipulation"
			class:cursor-not-allowed={value <= min}
			class:hover:bg-slate-200={value !== min}
			onclick={() => value > min && decrement(color)}
			aria-label="Decrease the counter by one"
		>
			<svg aria-hidden="true" viewBox="0 0 1 1" class="w-1/2 h-1/2">
				<path
					class="[vector-effect:non-scaling-stroke] stroke-2"
					class:stroke-zinc-700={value !== min}
					class:stroke-zinc-400={value <= min}
					d="M0,0.5 L1,0.5"
				/>
			</svg>
		</button>
	{:else}
		<div class="h-6 md:h-8"></div>
	{/if}
</div>
