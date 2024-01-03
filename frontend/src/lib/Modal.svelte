<script lang="ts">
	export let closeModal: () => void;
	export let open: boolean;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	on:click|self={() => closeModal()}
	on:keypress|self={(e) => e.key === 'Escape' && closeModal()}
	class="fixed top-0 bottom-0 left-0 right-0 z-10 flex items-center justify-center bg-gray-600 bg-opacity-40"
	class:hidden={!open}
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="p-4 bg-white rounded-md" on:click|stopPropagation on:keypress|stopPropagation>
		<slot name="header" />
		<slot />
		<!-- svelte-ignore a11y-autofocus -->
		<button
			class="block"
			autofocus
			on:click={() => closeModal()}
			on:keypress={(e) => ['Space', 'Enter'].includes(e.key) && closeModal()}
		>
			close modal
		</button>
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
