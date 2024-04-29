<script lang="ts">
	export let closeModal: () => void;
	export let open: boolean;
	export let className: string = '';
	export let actions: { colorClass: string; text: string; handler: () => void }[] = [];
	$: cn = ' ' + className;
	$: allActions = [{ colorClass: '', text: 'Cancel', handler: closeModal }, ...actions];
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	on:click|self={() => closeModal()}
	on:keypress|self={(e) => e.key === 'Escape' && closeModal()}
	class="fixed top-0 bottom-0 left-0 right-0 z-10 flex items-center justify-center bg-gray-600 bg-opacity-40"
	class:hidden={!open}
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class={'p-2 md:p-4 bg-white rounded-lg md:rounded-2xl shadow' + cn}
		on:click|stopPropagation
		on:keypress|stopPropagation
	>
		<slot />
		<div class="flex justify-end gap-2">
			{#each allActions as action}
				<!-- svelte-ignore a11y-autofocus -->
				<button
					class={'px-3 py-1 border border-gray-400 rounded-md ' + action.colorClass}
					autofocus={action.text === 'Cancel'}
					on:click={() => action.handler()}
					on:keypress={(e) => ['Space', 'Enter'].includes(e.key) && action.handler()}
				>
					{action.text}
				</button>
			{/each}
		</div>
	</div>
</div>

<!-- <style>
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}

	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style> -->
