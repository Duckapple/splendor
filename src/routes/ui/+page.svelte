<script lang="ts">
	import Background from '$lib/compose/Background.svelte';
	import { cardFromId } from '$common/defaults';
</script>

<Background card={cardFromId(143)} class="opacity-60" />

<div
	class="absolute inset-0 flex flex-col items-center justify-center [text-shadow:-1px_-1px_0_#fff,_1px_-1px_0_#fff,_-1px_1px_0_#fff,_1px_1px_0_#fff;]"
>
	<div class="w-[1200px] h-[675px] flex flex-col items-center justify-center">
		<span class="text-9xl text-slate-950">You're invited!</span>
		<span class="text-6xl">Click to join!</span>
	</div>
</div>
