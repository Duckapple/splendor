<script lang="ts">
	import type { KeyboardEventHandler, MouseEventHandler } from 'svelte/elements';

	interface Props {
		closeModal: () => void;
		open: boolean;
		className?: string;
		actions?: { colorClass: string; text: string; handler: () => void }[];
		children?: import('svelte').Snippet;
		onclick?: MouseEventHandler<HTMLDivElement> | null;
		onkeypress?: KeyboardEventHandler<HTMLDivElement> | null;
	}

	let {
		closeModal,
		open,
		className = '',
		actions = [],
		children,
		onclick,
		onkeypress,
	}: Props = $props();

	let cn = $derived(' ' + className);
	let allActions = $derived([{ colorClass: '', text: 'Cancel', handler: closeModal }, ...actions]);

	let element = $state<HTMLDivElement>();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	onclick={(e) => e.target === element && closeModal()}
	onkeypress={(e) => e.target === element && e.key === 'Escape' && closeModal()}
	class="fixed top-0 bottom-0 left-0 right-0 z-10 flex items-center justify-center bg-gray-600 bg-opacity-40"
	class:hidden={!open}
	bind:this={element}
>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class={'p-2 md:p-4 bg-white rounded-lg md:rounded-2xl shadow' + cn}
		onclick={(e) => {
			e.stopPropagation();
			onclick?.(e);
		}}
		onkeypress={(e) => {
			e.stopPropagation();
			onkeypress?.(e);
		}}
	>
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
