<script lang="ts">
	import { run } from 'svelte/legacy';

	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import Modal from '../Modal.svelte';
	import { Color, type GameState, type Player } from '../../../../common/model';
	import { client } from '../main';
	import Coin from '../game/Coin.svelte';
	import { range } from '../../../../common/utils';
	import InfoTooltip from '$lib/InfoTooltip.svelte';
	import { moveTo } from '$lib/move';

	interface Props {
		closeModal: () => void;
		open: boolean;
		game: GameState | null | undefined;
		player: Player | undefined;
		initialCoinColor: Color | null;
		center: HTMLDivElement;
		targetCoin: HTMLElement | undefined;
	}

	let {
		closeModal,
		open = $bindable(),
		game,
		player,
		initialCoinColor,
		center = $bindable(),
		targetCoin,
	}: Props = $props();

	const queryClient = useQueryClient();

	let error = $state('');

	const onClose = $derived(() => {
		targetCoin?.classList.remove('hidden');
		error = '';
		closeModal();
	});

	let tokens = $state<Color[]>([]);
	$effect.pre(() => {
		tokens = [null, Color.Y].includes(initialCoinColor) ? [] : [initialCoinColor!];
	});

	$effect(() => {
		if (initialCoinColor === Color.Y) {
			error = 'Cannot take yellow tokens. Reserve a card if you want one.';
		}
	});

	let takenOfEach = $derived(
		range(6).map((color) => tokens.filter((token) => token === color).length)
	);
	let leftOverOfEach = $derived((game?.tokens ?? []).map((count, i) => count - takenOfEach[i]));

	let tryTake = $derived((color: Color) => {
		error = '';
		let newTokens = [...tokens, color];

		if (color === Color.Y) {
			error = 'Cannot take yellow tokens. Reserve a card if you want one.';
			return;
		}

		if (tokens.includes(color) && tokens[0] !== tokens[1]) {
			if (leftOverOfEach[color] < 3) {
				error = 'Cannot take two tokens from stacks with fewer than 4 tokens.';
				return;
			}
			newTokens = [color, color];
		}

		if (newTokens.length > 3) {
			error = 'Cannot take more than 3 tokens.';
			return;
		}

		if (tokens[0] != null && tokens[0] === tokens[1]) {
			if (color === tokens[0]) {
				error = 'Cannot take 3 tokens of a kind.';
				return;
			}
			// Replace one of two like colors with new pick
			newTokens.shift();
		}

		tokens = newTokens;
	});

	let takeMutation = $derived(
		createMutation({
			mutationKey: ['action', 'TAKE_TOKENS'],
			async mutationFn() {
				if (!player || !game) {
					throw { message: 'Invalid initial state. Retry the action, this time slowly' };
				}

				const body = {
					type: 'TAKE_TOKENS',
					data: {
						tokens: tokens as [number] | [number, number] | [number, number, number],
						returned: undefined,
					},
				} as const;

				const res = await client.action({ id: game.id }).post(body);
				if (res.data) {
					queryClient.setQueryData(['game', game.id], res);
				}

				onClose();
			},
		})
	);
</script>

<Modal
	closeModal={onClose}
	{open}
	actions={[
		{
			colorClass: 'bg-green-200',
			text: 'Take',
			handler: $takeMutation.mutateAsync,
		},
	]}
	class="max-w-72 md:max-w-3xl"
>
	<h1 class="flex justify-between text-xl">
		<span>Take tokens</span>
		<InfoTooltip size="xl">
			<div class="space-y-1">
				<p>On your turn, you can take up to three tokens. The following has to be satisfied:</p>
				<ul class="pl-4 list-disc">
					<li class="pb-1">You may take three different tokens</li>
					<li>You may take two of a kind, but:</li>
					<ul class="pb-1 pl-4 list-disc">
						<li>There have to be four or more tokens of that kind available</li>
						<li>You may not take a third token</li>
					</ul>
					<li>You can only have a max of 10 tokens</li>
					<ul class="pl-4 list-disc">
						<li>
							If your total comes over 10 by taking tokens, you can return some to get below or at
							10 (WIP)
						</li>
					</ul>
				</ul>
			</div>
		</InfoTooltip>
	</h1>
	<div class="flex flex-col-reverse gap-4 pt-4 pb-2 md:pt-6 md:gap-8">
		<div class="relative flex gap-1.5 md:gap-4">
			<div
				class="absolute size-10 md:size-24 flex justify-center items-center"
				style="left: calc({initialCoinColor ?? 0} * var(--coin-with-gap))"
			>
				<div bind:this={center}></div>
			</div>
			{#each leftOverOfEach ?? [] as stackSize, color}
				<Coin {color} {stackSize} onclick={() => stackSize > 0 && tryTake(color)} />
			{/each}
		</div>
		<div class="relative flex gap-1.5 md:gap-4">
			{#each takenOfEach as stackSize, color}
				<Coin
					{color}
					{stackSize}
					onclick={() => {
						error = '';
						if (tokens.indexOf(color) !== -1) tokens = tokens.toSpliced(tokens.indexOf(color), 1);
					}}
				/>
			{/each}
		</div>
	</div>
	<span class="text-red-700">{error || ($takeMutation.error?.message ?? '')}&nbsp;</span>
</Modal>

<style>
	:root {
		--coin-with-gap: calc(40px + 6px);
	}

	@media (min-width: 768px) {
		:root {
			--coin-with-gap: calc(96px + 16px);
		}
	}
</style>
