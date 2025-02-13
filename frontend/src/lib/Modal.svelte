<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import type { KeyboardEventHandler, MouseEventHandler } from 'svelte/elements';
	import InfoTooltip from './InfoTooltip.svelte';
	import { on } from 'svelte/events';
	import { stopPropagation } from 'svelte/legacy';

	interface Props {
		closeModal: () => void;
		open: boolean;
		title: string;
		info?: Snippet;
		target?: HTMLElement;
		class?: string;
		actions?: { colorClass: string; text: string; handler: () => void }[];
		children?: Snippet;
		onclick?: MouseEventHandler<HTMLDivElement> | null;
		onkeypress?: KeyboardEventHandler<HTMLDivElement> | null;
	}

	let {
		closeModal,
		open,
		title,
		info,
		target = $bindable(),
		class: cn = '',
		actions = [],
		children,
		onclick,
		onkeypress,
	}: Props = $props();

	let allActions = $derived([{ colorClass: '', text: 'Cancel', handler: closeModal }, ...actions]);

	let element = $state<HTMLDivElement>();

	let modalOffset = $state({ x: 0, y: 0 });
	let dragOrigin = $state<{ x: number; y: number }>();
	let drag = $state<{ x: number; y: number }>();

	$inspect(drag);

	onMount(() => {
		on(window, 'mousemove', (e) => {
			if (!dragOrigin) return;
			drag = { x: e.screenX - dragOrigin.x, y: e.screenY - dragOrigin.y };
		});
		on(window, 'mouseup', () => {
			dragOrigin = undefined;
			modalOffset = { x: modalOffset.x + (drag?.x ?? 0), y: modalOffset.y + (drag?.y ?? 0) };
			drag = undefined;
		});
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	onclick={(e) => e.target === element && closeModal()}
	onkeypress={(e) => e.target === element && e.key === 'Escape' && closeModal()}
	class="fixed top-0 bottom-0 left-0 right-0 z-10 flex items-center justify-center bg-slate-600 bg-opacity-40"
	class:hidden={!open}
	bind:this={element}
>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class={['p-2 md:p-4 bg-white rounded-lg md:rounded-2xl shadow', cn]}
		onclick={(e) => {
			e.stopPropagation();
			onclick?.(e);
		}}
		onkeypress={(e) => {
			e.stopPropagation();
			onkeypress?.(e);
		}}
		style="transform: translate({modalOffset.x + (drag?.x ?? 0)}px, {modalOffset.y +
			(drag?.y ?? 0)}px)"
	>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<h1
			class="flex justify-between text-xl cursor-grab"
			onmousedown={(e) => {
				e.stopPropagation();
				dragOrigin = { x: e.screenX, y: e.screenY };
			}}
		>
			<span class="select-none">{title}</span>
			{#if info}
				<InfoTooltip
					size="xl"
					onpointerenter={() => {
						if (window.matchMedia('(min-width: 768px)').matches) return;
						target && target.setAttribute('style', target.getAttribute('style') + '; opacity: 0');
					}}
					onpointerleave={() =>
						target &&
						target.setAttribute(
							'style',
							target.getAttribute('style')?.replace('; opacity: 0', '') ?? ''
						)}
				>
					{@render info()}
				</InfoTooltip>
			{/if}
		</h1>
		{@render children?.()}
		<div class="flex justify-end gap-2 pt-2">
			{#each allActions as action}
				<!-- svelte-ignore a11y_autofocus -->
				<button
					class={'px-3 py-1 border border-slate-500 rounded-md ' + action.colorClass}
					autofocus={action.text === 'Cancel'}
					onclick={() => action.handler()}
					onkeypress={(e) => ['Space', 'Enter'].includes(e.key) && action.handler()}
				>
					{action.text}
				</button>
			{/each}
		</div>
	</div>
</div>
