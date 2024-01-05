<script lang="ts">
	import { textColorOf } from '$lib/color';
	import { spring } from 'svelte/motion';
	import type { Color } from '../../../common/model';

	export let color: Color;

	export let min = 0;
	export let value = 0;
	export let max = 5;

	export let invalid = false;
	export let noButtons = false;

	export let decrement = () => {};
	export let increment = () => {};

	const displayed_count = spring();
	$: displayed_count.set(value);
	$: offset = modulo($displayed_count, 1);

	function modulo(n: number, m: number) {
		// handle negative numbers
		return ((n % m) + m) % m;
	}
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
			on:click={() => value < max && increment()}
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
		<div class="h-6 md:h-8" />
	{/if}

	<div
		class={'w-8 h-12 md:w-14 md:h-16 overflow-hidden text-center relative cursor-default ' +
			textColorOf[color]}
		class:text-opacity-60={value === 0}
	>
		<div
			class="absolute inset-0 text-5xl font-normal md:text-7xl"
			style="transform: translate(0, {100 * offset}%)"
		>
			<span
				class="absolute flex items-center justify-center w-full h-full select-none -top-full"
				aria-hidden="true">{Math.floor($displayed_count + 1)}</span
			>
			<span
				class="absolute flex items-center justify-center w-full h-full decoration-red-500"
				class:underline={invalid}>{Math.floor($displayed_count)}</span
			>
		</div>
	</div>

	{#if !noButtons}
		<button
			class="flex items-center justify-center h-6 p-0 bg-transparent border-0 md:h-8 rounded-b-md md:rounded-b-xl touch-manipulation"
			class:cursor-not-allowed={value <= min}
			class:hover:bg-slate-200={value !== min}
			on:click={() => value > min && decrement()}
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
		<div class="h-6 md:h-8" />
	{/if}
</div>
