<script lang="ts">
	import Spinner from '$lib/Spinner.svelte';

	export let loading = false;
	export let onClick: (evt: MouseEvent) => void;
	let className = '';
	export { className as class };
</script>

<button
	class="p-1 border border-slate-500 rounded md:px-2 md:text-lg {className}"
	on:click={onClick}
>
	{#if loading}
		<Spinner />
	{/if}
	<slot />
</button>
