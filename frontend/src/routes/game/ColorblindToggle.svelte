<script lang="ts">
	import Icon from '$lib/base/Icon.svelte';
	import { useRuneContext } from '$lib/state/context-rune.svelte';

	const colorblind = useRuneContext('colorblind');
	let hovering = $state(false);
</script>

<button
	onpointerenter={() => (hovering = true)}
	onpointerleave={() => (hovering = false)}
	onclick={() => (colorblind.value = !colorblind.value)}
>
	<Icon icon={hovering ? 'gem-heart' : 'gem-hexagon'} class="size-6 md:size-8 rotate-12" />
</button>
