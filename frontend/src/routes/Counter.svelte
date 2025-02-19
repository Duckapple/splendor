<script lang="ts">
	import { run } from 'svelte/legacy';

	import { iconOf, textColorOf } from '$lib/color';
	import { Spring } from 'svelte/motion';
	import type { Color } from '../../../common/model';
	import { useRuneContext } from '$lib/state/contextRune.svelte';
	import Icon from '$lib/base/Icon.svelte';

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
		decrement = (_: Color) => {},
		increment = (_: Color) => {},
	}: Props = $props();

	const colorblind = useRuneContext('colorblind');

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
			class={[
				'flex flex-col gap-1 items-center justify-center p-0 md:p-1 bg-transparent border-0 rounded-t-md md:rounded-t-xl touch-manipulation',
				value >= max && 'cursor-not-allowed',
				value < max && 'hover:bg-slate-200',
			]}
			onclick={() => value < max && increment(color)}
			aria-label="Increase the counter by one"
		>
			{#if colorblind.value}
				<Icon icon={iconOf[color]} class={['rotate-12 size-6 mx-auto', textColorOf[color]]} />
			{/if}
			<svg aria-hidden="true" viewBox="0 0 1 1" class="size-4 flex-none">
				<path
					class={[
						'[vector-effect:non-scaling-stroke] stroke-2',
						value < max && 'stroke-zinc-700',
						value >= max && 'stroke-zinc-300',
					]}
					d="M0,0.5 L1,0.5 M0.5,0 L0.5,1"
				/>
			</svg>
		</button>
	{:else}
		<div class="h-6 md:h-8"></div>
	{/if}

	<div
		class={[
			'w-8 h-12 md:w-14 md:h-16 overflow-hidden text-center relative cursor-default border-red-500 ',
			textColorOf[color],
			value === 0 && 'text-opacity-60',
			invalid && 'border-b-2',
		]}
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
			class={[
				'flex items-center justify-center h-6 p-0 bg-transparent border-0 md:h-8 rounded-b-md md:rounded-b-xl touch-manipulation',
				value <= min && 'cursor-not-allowed',
				value !== min && 'hover:bg-slate-200',
			]}
			onclick={() => value > min && decrement(color)}
			aria-label="Decrease the counter by one"
		>
			<svg aria-hidden="true" viewBox="0 0 1 1" class="size-1/2">
				<path
					class={[
						'[vector-effect:non-scaling-stroke] stroke-2',
						value !== min && 'stroke-zinc-700',
						value <= min && 'stroke-zinc-300',
					]}
					d="M0,0.5 L1,0.5"
				/>
			</svg>
		</button>
	{:else}
		<div class="h-6 md:h-8"></div>
	{/if}
</div>
