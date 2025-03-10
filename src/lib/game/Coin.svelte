<script lang="ts">
	import { bgColorOf, fadeTextBgColorOf, iconOf, ringColorOf } from '$lib/color';
	import type { Color } from '$common/model';
	import type { KeyboardEventHandler, MouseEventHandler } from 'svelte/elements';
	import Icon from '$lib/base/Icon.svelte';

	interface Props {
		color: Color;
		stackSize?: number;
		hideNumber?: boolean;
		small?: boolean;
		onclick?: MouseEventHandler<HTMLButtonElement> | null;
		onkeypress?: KeyboardEventHandler<HTMLButtonElement> | null;
		class?: string;
	}

	let {
		color,
		stackSize = 1,
		hideNumber = false,
		small = false,
		onclick,
		onkeypress,
		class: cn,
	}: Props = $props();

	const coinMd = 'md:text-4xl md:h-24 md:w-24 md:-mb-[6.5rem] md:ring-4';
	const boxMd = 'md:h-24 md:w-24';
</script>

<button
	data-coin-color={color}
	onclick={onclick && ((e) => stackSize && onclick(e))}
	{onkeypress}
	class={[
		'flex flex-col w-10 h-10 transition-[transform,opacity] group',
		!small && boxMd,
		cn,
		onclick && stackSize ? 'cursor-pointer' : 'cursor-default',
	]}
>
	{#each Array(stackSize) as _, i}
		{@const top = !hideNumber && i + 1 === stackSize}
		<div
			class="{!small &&
				coinMd} relative h-10 w-10 select-none transition-transform flex justify-center items-center last:mb-0 -mb-11 group-hover:last:-translate-y-2 rounded-full aspect-square ring-2 {bgColorOf[
				color
			]} {ringColorOf[color]}"
		>
			{#if top && iconOf[color]}
				<Icon
					icon={iconOf[color]}
					class="absolute {small ? 'inset-1' : 'inset-1 md:inset-2'} {fadeTextBgColorOf[color]}"
				/>
			{/if}
			{#if top}
				<span class="z-10">{stackSize}</span>
			{/if}
		</div>
	{/each}
</button>
