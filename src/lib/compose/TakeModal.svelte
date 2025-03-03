<script lang="ts">
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import Modal from '../Modal.svelte';
	import { Color, type GameState, type Player } from '$common/model';
	import { client } from '../main';
	import { range } from '$common/utils';
	import { useUpdateGameState } from '$lib/state/update-game';
	import SelectTokens from './SelectTokens.svelte';
	import { slide } from 'svelte/transition';

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
		targetCoin = $bindable(),
	}: Props = $props();

	const queryClient = useQueryClient();
	const { updateGameState } = useUpdateGameState(queryClient);

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

	let returns = $state<Color[]>([]);
	let shouldReturn = $derived(
		Math.max((player?.tokens.reduce((x, a) => x + a) ?? 0) + tokens.length, 10) - 10
	);
	let returnError = $state('');

	let takeMutation = $derived(
		createMutation({
			mutationKey: ['action', 'TAKE_TOKENS'],
			async mutationFn() {
				if (!player || !game) {
					error = 'Invalid initial state. Retry the action, this time slowly';
					throw new Error();
				}

				if (returns.length !== shouldReturn) {
					returnError = 'You have to return the required amount of tokens, or take fewer tokens';
					throw new Error();
				}

				type Tokens = [number] | [number, number] | [number, number, number];
				const body = {
					type: 'TAKE_TOKENS',
					data: {
						tokens: tokens as Tokens,
						returned: returns.length ? (returns as Tokens) : undefined,
					},
				} as const;

				const res = await client.api.action({ id: game.id }).post(body);
				if (res.data) {
					updateGameState(game.id, res);
				} else {
					error = 'Invalid action. Retry the action, perhaps reloading the page first';
					throw res.error;
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
	class="max-w-80 md:max-w-3xl"
	title="Take tokens"
	bind:target={targetCoin}
>
	{#snippet info()}
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
						If your total comes over 10 by taking tokens, you can return some to get below or at 10
						(WIP)
					</li>
				</ul>
			</ul>
		</div>
	{/snippet}
	<SelectTokens
		{initialCoinColor}
		holdTokens={game?.tokens}
		bind:tokens
		bind:error
		{tryTake}
		tryReturn={(color) => {
			error = '';
			if (tokens.indexOf(color) !== -1) {
				tokens = tokens.toSpliced(tokens.indexOf(color), 1);
				returns.pop();
			}
		}}
		bind:center
	/>
	{#if shouldReturn}
		<div transition:slide={{ axis: 'y' }}>
			<h2 class="text-lg border-t mt-4 pt-4">
				Return {shouldReturn} token{shouldReturn !== 1 ? 's' : ''}
			</h2>
			<SelectTokens
				{initialCoinColor}
				holdTokens={player?.tokens}
				bind:tokens={returns}
				bind:error={returnError}
				tryTake={(color) => {
					returnError = '';
					if (returns.length < shouldReturn) returns.push(color);
					else returnError = 'You have already selected the required amount of tokens to return';
				}}
				tryReturn={(color) => {
					returnError = '';
					if (returns.indexOf(color) !== -1) returns = returns.toSpliced(returns.indexOf(color), 1);
				}}
			/>
		</div>
	{/if}
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
