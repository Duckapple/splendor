<script lang="ts">
	import { spring } from 'svelte/motion';

	let count = 0;

	const displayed_count = spring();
	$: displayed_count.set(count);
	$: offset = modulo($displayed_count, 1);

	function modulo(n: number, m: number) {
		// handle negative numbers
		return ((n % m) + m) % m;
	}
</script>

<div class="flex my-4 border-t border-b border-gray-100 counter">
	<button
		class="flex items-center justify-center w-16 p-0 bg-transparent border-0 rounded-l-xl touch-manipulation hover:bg-slate-200"
		on:click={() => (count -= 1)}
		aria-label="Decrease the counter by one"
	>
		<svg aria-hidden="true" viewBox="0 0 1 1" class="w-1/4 h-1/4">
			<path class="[vector-effect:non-scaling-stroke] stroke-2 stroke-zinc-700" d="M0,0.5 L1,0.5" />
		</svg>
	</button>

	<div class="w-32 h-16 overflow-hidden text-center relative text-[#ff3e00]">
		<div
			class="absolute inset-0 font-normal text-7xl"
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
		class="flex items-center justify-center w-16 p-0 bg-transparent border-0 rounded-r-xl touch-manipulation hover:bg-slate-200"
		on:click={() => (count += 1)}
		aria-label="Increase the counter by one"
	>
		<svg aria-hidden="true" viewBox="0 0 1 1" class="w-1/4 h-1/4">
			<path
				class="[vector-effect:non-scaling-stroke] stroke-2 stroke-zinc-700"
				d="M0,0.5 L1,0.5 M0.5,0 L0.5,1"
			/>
		</svg>
	</button>
	<script lang="ts">
		(async function () {
			const allowedNotifications = await window.Notification.requestPermission();
			console.log(allowedNotifications);
		})();
	</script>
</div>
