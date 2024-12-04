<script lang="ts">
	import { cachedWritable, client, userNames } from '$lib/main';
	import { createQuery } from '@tanstack/svelte-query';
	import type { Action } from '../../../../common/model';
	import Coin from '$lib/game/Coin.svelte';
	import Card from '$lib/game/Card.svelte';
	import { cardFromId } from '../../../../common/defaults';
	import { moveTo } from '$lib/move';

	export let gameId: string;
	let center: HTMLDivElement;
	let target: HTMLElement | undefined;
	function setCurrent(newVal: HTMLElement | undefined) {
		if (target) {
			target.setAttribute('style', '');
		}
		target = newVal;
	}

	const actionsCache = cachedWritable<Action[]>(`actions-${gameId}`, []);

	createQuery({
		queryKey: ['actions', gameId],
		async queryFn() {
			const last = $actionsCache.at(-1);
			const params: Record<string, string> = {};
			if (last != null) params['since'] = last.timestamp as unknown as string;
			const data = await client.action({ id: gameId }).get({ query: params });
			if (data.error) throw data.error;
			actionsCache.update((cache) => cache.concat(data.data));
			return $actionsCache;
		},
		initialData: $actionsCache,
	});

	$: orderedActions = [...($actionsCache ?? [])].reverse();

	$: cardClick = (card: EventTarget | null) => {
		if (!(card instanceof HTMLElement)) return;
		if (target === card) {
			setCurrent(undefined);
			return;
		}
		setCurrent(card);
		moveTo(card, card);
	};
</script>

<div class="absolute inset-0 flex items-center justify-center pointer-events-none">
	<div class="w-0 h-0" bind:this={center}></div>
</div>
<div class="p-2 overflow-y-auto text-sm max-h-[calc(100svh-5rem)] divide-y">
	{#each orderedActions as action}
		<div class="grid items-center grid-cols-3 gap-x-2 min-h-16">
			{#if action.type === 'TAKE_TOKENS'}
				<span>{$userNames[action.userId]}</span>
				<span class="justify-self-end">took</span>
				<div class="flex gap-2 scale-50 justify-self-center">
					{#each action.data.tokens as color}
						<Coin {color} small hideNumber />
					{/each}
				</div>
				{#if action.data.returned}
					<span>returning</span>
					<span></span>
					<div class="flex gap-2 scale-50 justify-self-center">
						{#each action.data.returned as color}
							<Coin {color} small hideNumber />
						{/each}
					</div>
				{/if}
			{:else if action.type === 'BUY_CARD'}
				<span>{$userNames[action.userId]}</span>
				<span class="justify-self-end">bought</span>
				<div class="scale-75 justify-self-center">
					<Card
						card={cardFromId(action.data.card)}
						small
						on:click={(e) => cardClick(e.currentTarget)}
					/>
				</div>
			{:else}
				<span>{$userNames[action.userId]}</span>
				<span class="justify-self-end">reserved</span>
				<div class="scale-75 justify-self-center">
					<Card
						card={cardFromId(action.data.card)}
						rotated
						small
						on:click={(e) => cardClick(e.currentTarget)}
					/>
				</div>
			{/if}
		</div>
	{/each}
</div>
