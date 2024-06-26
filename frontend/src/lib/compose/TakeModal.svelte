<script lang="ts">
	import { createMutation } from '@tanstack/svelte-query';
	import Modal from '../Modal.svelte';
	import type { Color, GameState, Player } from '../../../../common/model';
	import { authed } from '../main';
	import Coin from '../game/Coin.svelte';
	import { range } from '../../../../common/utils';
	import InfoTooltip from '$lib/InfoTooltip.svelte';

	export let closeModal: () => void;
	export let open: boolean;
	export let game: GameState | undefined;
	export let player: Player | undefined;
	export let initialCoinColor: Color | null;

	export let center: HTMLDivElement;
	export let targetCoin: HTMLElement | undefined;

	$: error = '';

	$: onClose = () => {
		targetCoin?.classList.remove('hidden');
		closeModal();
	};

	$: tokens = initialCoinColor == null ? [] : [initialCoinColor];

	$: takenOfEach = range(6).map((color) => tokens.filter((token) => token === color).length);
	$: leftOverOfEach = game?.tokens.map((count, i) => count - takenOfEach[i]);

	$: tryTake = (color: Color) => {
		error = '';
		const newTokens = [...tokens, color];

		if (tokens.length === 3) {
			error = 'Cannot take more than 3 tokens';
			return;
		}
		if (tokens[0] != null && tokens[0] === tokens[1]) {
			if (color === tokens[0]) {
				error = 'Cannot take 3 tokens of a kind';
				return;
			}
			// Replace one of two like colors with new pick
			newTokens.shift();
		}

		tokens = newTokens;
	};

	$: takeMutation = createMutation({
		mutationKey: ['action', 'TAKE_TOKENS'],
		async mutationFn() {
			if (!player || !game) {
				throw { message: 'Invalid initial state. Retry the action, this time slowly' };
			}

			const body = {
				type: 'TAKE_TOKENS',
				data: { tokens: tokens, returned: undefined },
			};

			const res = await authed({
				method: 'POST',
				route: '/action',
				params: { gameId: game.id },
				body,
			});

			onClose();
		},
	});
</script>

<Modal
	bind:closeModal={onClose}
	bind:open
	actions={[
		{
			colorClass: 'bg-green-200',
			text: 'Take',
			handler: $takeMutation.mutateAsync,
		},
	]}
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
		<div class="flex gap-1.5 md:gap-4">
			{#each leftOverOfEach ?? [] as stackSize, color}
				<Coin {color} {stackSize} on:click={() => stackSize > 0 && tryTake(color)} />
			{/each}
		</div>
		<div class="flex gap-1.5 md:gap-4">
			{#each takenOfEach as stackSize, color}
				<Coin
					{color}
					{stackSize}
					on:click={() => {
						error = '';
						if (tokens.indexOf(color) !== -1) tokens = tokens.toSpliced(tokens.indexOf(color), 1);
					}}
				/>
			{/each}
		</div>
	</div>
	<span class="text-red-600">{error || ($takeMutation.error?.message ?? '')}&nbsp;</span>
</Modal>
<div bind:this={center} class="fixed w-0 h-0 top-1/2 left-1/2"></div>
