<script lang="ts">
	import Spinner from '$lib/Spinner.svelte';

	interface Props {
		loading?: boolean;
		onClick: (evt: MouseEvent) => void;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { loading = false, onClick, class: className = '', children }: Props = $props();
</script>

<button
	class="p-1 border border-slate-300 shadow-sm rounded transition-all md:px-2 hover:scale-105 hover:text-slate-600 disabled:grayscale-0 {className}"
	onclick={onClick}
>
	{#if loading}
		<Spinner />
	{/if}
	{@render children?.()}
</button>
