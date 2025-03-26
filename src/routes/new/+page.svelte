<script lang="ts">
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { timeAgo } from '$lib/timeAgo';
	import { client, isLoggedIn, jwt, user } from '$lib/main';
	import Background from '$lib/compose/Background.svelte';
	import { cardFromId } from '$common/defaults';
	import Login from '$lib/Login.svelte';
	import Button from '$lib/base/Button.svelte';
	import { getWebSocket } from '$lib/web-socket.svelte';
	import { page } from '$app/state';
	import { roomQuery } from './_queries';
	import { goto } from '$app/navigation';

	const queryClient = useQueryClient();

	const searchId = page.url.searchParams.get('id');

	const ws = getWebSocket();
	let subbed = $state(false);
	$effect(() => {
		if (jwt && ws && !subbed) {
			ws?.subscribe(({ data }) => {
				switch (data.type) {
					case 'game-started':
						goto(`/game?id=${data.id}`);
						break;
				}
			});
			subbed = true;
		}
	});

	const room = $derived(createQuery(roomQuery(fetch, searchId)));

	const joinRoom = createMutation({
		mutationFn: async () => {
			if (searchId == null) throw { message: 'ID undefined' };
			const result = await client.api.room({ id: searchId }).put();
			queryClient.setQueryData(['room', searchId], result);
			return result;
		},
	});

	const startGame = createMutation({
		mutationFn: async () => {
			if (searchId == null) throw { message: 'ID undefined' };
			const result = await client.api.game({ id: searchId }).post();
			if (result.data?.id) goto(`/game?id=${result.data.id}`);
			return result;
		},
	});

	$effect(() => {
		if ($room.data?.data.started) {
			window.location.href = `/game?id=${searchId}`;
		}
	});
</script>

<svelte:head>
	<title>New Splendor room</title>
	<meta name="description" content="You have been invited to a new room. Click to join the fun!" />
	<meta name="og:image" content="/new-game.webp" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<Background card={cardFromId(143)} />

<div class="z-30 flex flex-col items-center justify-center w-full h-screen">
	<div class="flex flex-col p-2 m-2 rounded-md shadow-sm md:p-4 bg-slate-50">
		{#if !$isLoggedIn}
			<Login onSuccess={() => {}} />
		{/if}
		{#if $room.data?.error}
			{@const err = $room.data.error.value}
			{#if 'data' in err && err.data === 'NOT_IN_ROOM'}
				<span class="text-2xl mb-2">You are not in this room!</span>
				<Button loading={$joinRoom.isPending} onClick={() => $joinRoom.mutate()}>
					Join the room
				</Button>
				<Button href="/" class="mt-2">Go back</Button>
			{:else}
				<span class="text-red-700">{err?.message}</span>
			{/if}
		{:else if $room.isSuccess && $room.data.data != null}
			{@const data = $room.data.data}
			{@const ownerName = data.players.find(({ userId }) => data?.ownerId === userId)?.userName}
			<div class="max-w-md p-2">
				<h1 class="pb-4 pr-20 text-5xl">New game</h1>
				<p class="text-sm text-right">
					Opened {timeAgo(data.createdAt)}
					<br />
					by {ownerName}
				</p>
				Players:
				<ul class="pl-6 list-disc">
					{#each data.players as player}
						<li>
							{player.userName}
							{#if player.userId === data.ownerId}👑{/if}
						</li>
					{/each}
				</ul>
				{#if data.ownerId === $user?.id && data.players.length > 1}
					<Button
						onClick={() => $startGame.mutate()}
						loading={$startGame.isPending}
						class="mt-2 bg-green-100"
					>
						Start the game
					</Button>
				{/if}
				<Button href="/" class="mt-2">Go back</Button>
			</div>
		{:else if $room.isSuccess}
			Game doesn't exist
			<Button href="/" class="mt-2">Go back</Button>
		{/if}
	</div>
</div>
