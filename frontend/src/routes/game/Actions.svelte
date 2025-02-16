<script lang="ts">
	import { cachedWritable, client, userNames } from '$lib/main';
	import { createQuery } from '@tanstack/svelte-query';
	import type { Action } from '../../../../common/model';
	import Coin from '$lib/game/Coin.svelte';
	import Card from '$lib/game/Card.svelte';
	import { cardFromId } from '../../../../common/defaults';
	import { moveTo } from '$lib/move';

	interface Props {
		gameId: string;
	}

	let { gameId }: Props = $props();
	let target: HTMLElement | undefined = $state();
	function setCurrent(newVal: HTMLElement | undefined) {
		if (target) {
			target.setAttribute('style', '');
		}
		target = newVal;
	}

	const actionsCache = cachedWritable<Action[]>(`actions-${gameId}`, []);

	const query = createQuery({
		queryKey: ['actions', gameId],
		async queryFn() {
			const last = $actionsCache.at(-1);
			const params: Record<string, string> = {};
			if (last != null) params['since'] = last.timestamp as unknown as string;
			const data = await client.api.action({ id: gameId }).get({ query: params });
			if (data.error) throw data.error;
			actionsCache.update((cache) => cache.concat(data.data));
			return $actionsCache;
		},
		initialData: $actionsCache,
	});

	// $effect(() => {
	// 	if (orderedActions.length === 0) {
	// 		$query.refetch();
	// 	}
	// });

	let orderedActions = $derived([...($actionsCache ?? [])].reverse());
	$inspect(orderedActions);

	let cardClick = $derived((card: EventTarget | null) => {
		if (!(card instanceof HTMLElement)) return;
		if (target === card) {
			setCurrent(undefined);
			return;
		}
		setCurrent(card);
		moveTo(card, card);
	});
</script>

<div class="absolute top-0 left-0 flex items-center justify-center z-10">
	<div
		class="bg-white p-2 overflow-y-auto text-sm min-w-72 max-h-[calc(100svh-5rem)] divide-y grid grid-cols-3"
	>
		{#each orderedActions as action}
			<div class="grid items-center col-span-3 grid-cols-subgrid gap-x-2 min-h-16">
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
							onclick={(e) => cardClick(e.currentTarget)}
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
							onclick={(e) => cardClick(e.currentTarget)}
						/>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
