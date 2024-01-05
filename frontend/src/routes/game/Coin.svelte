<script lang="ts">
	import { bgColorOf } from '$lib/color';
	import type { Color } from '../../../../common/model';

	export let color: Color;
	export let stackSize = 1;
</script>

<div
	class="md:text-3xl flex items-center justify-center border border-black rounded-full aspect-square outline outline-white outline-2 md:outline-4 {bgColorOf[
		color
	]}"
>
	{stackSize === 1 ? '' : stackSize}
</div>
