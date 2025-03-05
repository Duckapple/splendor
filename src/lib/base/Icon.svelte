<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import { iconSvgs } from './icons';

	interface Props {
		icon: keyof typeof iconSvgs;
		class?: ClassValue;
	}
	let { icon, class: className = 'size-5' }: Props = $props();
</script>

<svg
	viewBox={iconSvgs[icon].viewBox}
	class={[
		'inline-block shrink-0 stroke-current [stroke-linejoin:round] [stroke-linecap:round] bg-transparent!',
		className,
		className.includes('fill-') ? '' : 'fill-transparent',
	]}
>
	{@html iconSvgs[icon].children}
</svg>
