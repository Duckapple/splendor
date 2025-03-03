<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { MouseEventHandler, PointerEventHandler } from 'svelte/elements';
	interface Props {
		size: 'xl' | 'md';
		children?: Snippet;
		onpointerenter?: PointerEventHandler<HTMLButtonElement> | null;
		onpointerleave?: PointerEventHandler<HTMLButtonElement> | null;
	}

	let { size, children, onpointerenter, onpointerleave }: Props = $props();

	const sizeClass = size === 'xl' ? 'text-xl size-7' : '';

	let clicked = $state(false);
	function onclick() {
		clicked = !clicked;
	}
</script>

<button
	{onpointerenter}
	{onpointerleave}
	{onclick}
	class="group cursor-default relative z-20 font-bold text-center border-2 border-slate-700 rounded-full {sizeClass}"
>
	<span>i</span>
	{#if clicked}
		<div class="fixed inset-0 cursor-pointer" title="Dismiss tooltip"></div>
	{/if}
	<div
		class="absolute right-0 p-2 overflow-y-auto text-base font-normal text-left bg-white border rounded-md md:left-0 top-full group-hover:block min-w-72 max-h-96 md:max-h-none {clicked
			? 'block'
			: 'hidden'}"
	>
		{@render children?.()}
	</div>
</button>
