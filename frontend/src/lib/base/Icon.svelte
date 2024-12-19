<script lang="ts">
	import { iconSvgs } from './icons';

	interface Props {
		icon: keyof typeof iconSvgs;
		class?: string;
	}
	let { icon, class: className = 'size-5' }: Props = $props();
</script>

<svg
	viewBox={iconSvgs[icon].viewBox}
	class="inline-block {className} flex-shrink-0 stroke-current [stroke-linejoin:round] [stroke-linecap:round] !bg-transparent {className.includes(
		'fill-'
	)
		? ''
		: 'fill-transparent'}"
>
	{@html iconSvgs[icon].children}
</svg>
