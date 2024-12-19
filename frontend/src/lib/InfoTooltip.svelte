<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { PointerEventHandler } from 'svelte/elements';
	interface Props {
		size: 'xl' | 'md';
		children?: Snippet;
		onpointerenter?: PointerEventHandler<HTMLDivElement> | null;
		onpointerleave?: PointerEventHandler<HTMLDivElement> | null;
	}

	let { size, children, onpointerenter, onpointerleave }: Props = $props();

	const sizeClass = size === 'xl' ? 'text-xl w-7 h-7' : '';
</script>

<div
	{onpointerenter}
	{onpointerleave}
	class="group relative z-10 font-bold text-center border-2 border-slate-700 rounded-full {sizeClass}"
>
	<span class="cursor-default">i</span>
	<div class="absolute bottom-0 right-0 hidden h-6 group-hover:block min-w-72 md:left-0"></div>
	<div
		class="absolute right-0 hidden p-2 overflow-y-auto text-base font-normal text-left bg-white border rounded-md md:left-0 top-full group-hover:block min-w-72 max-h-96 md:max-h-none"
	>
		{@render children?.()}
	</div>
</div>
