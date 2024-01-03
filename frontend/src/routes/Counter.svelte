<script lang="ts">
	import { textColorOf } from '$lib/color';
	import { spring } from 'svelte/motion';
	import { Color } from '../../../common/model';

	let min = 0;
	let count = 0;
	let max = 5;

	const displayed_count = spring();
	$: displayed_count.set(count);
	$: offset = modulo($displayed_count, 1);

	function modulo(n: number, m: number) {
		// handle negative numbers
		return ((n % m) + m) % m;
	}
</script>

<div class="flex flex-col my-4 shadow rounded-t-md md:rounded-t-xl rounded-b-md md:rounded-b-xl">
	<button
		class="flex items-center justify-center h-6 p-0 bg-transparent border-0 md:h-8 rounded-t-md md:rounded-t-xl touch-manipulation"
		class:cursor-not-allowed={count === max}
		class:hover:bg-slate-200={count !== max}
		on:click={() => count !== max && (count += 1)}
		aria-label="Increase the counter by one"
	>
		<svg aria-hidden="true" viewBox="0 0 1 1" class="w-1/2 h-1/2">
			<path
				class="[vector-effect:non-scaling-stroke] stroke-2"
				class:stroke-zinc-700={count !== max}
				class:stroke-zinc-400={count === max}
				d="M0,0.5 L1,0.5 M0.5,0 L0.5,1"
			/>
		</svg>
	</button>

	<div
		class={'w-8 h-12 md:w-14 md:h-16 overflow-hidden text-center relative ' + textColorOf[Color.R]}
		class:text-opacity-60={count === 0}
	>
		<div
			class="absolute inset-0 text-5xl font-normal md:text-7xl"
			style="transform: translate(0, {100 * offset}%)"
		>
			<span
				class="absolute flex items-center justify-center w-full h-full select-none -top-full"
				aria-hidden="true">{Math.floor($displayed_count + 1)}</span
			>
			<span class="absolute flex items-center justify-center w-full h-full"
				>{Math.floor($displayed_count)}</span
			>
		</div>
	</div>

	<button
		class="flex items-center justify-center h-6 p-0 bg-transparent border-0 md:h-8 rounded-b-md md:rounded-b-xl touch-manipulation"
		class:cursor-not-allowed={count === min}
		class:hover:bg-slate-200={count !== min}
		on:click={() => count !== min && (count -= 1)}
		aria-label="Decrease the counter by one"
	>
		<svg aria-hidden="true" viewBox="0 0 1 1" class="w-1/2 h-1/2">
			<path
				class="[vector-effect:non-scaling-stroke] stroke-2"
				class:stroke-zinc-700={count !== min}
				class:stroke-zinc-400={count === min}
				d="M0,0.5 L1,0.5"
			/>
		</svg>
	</button>
	<script lang="ts">
		(async function () {
			const allowedNotifications = await window.Notification.requestPermission();
			console.log(allowedNotifications);
		});
	</script>
</div>
