<script lang="ts">
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { timeAgo } from '$lib/timeAgo';
	import Spinner from '$lib/Spinner.svelte';
	import { authed, isLoggedIn, user } from '$lib/main';
	import { readable } from 'svelte/store';
	import Background from '$lib/compose/Background.svelte';
	import { cardFromId } from '../../../../common/defaults';
	import Login from '$lib/Login.svelte';
	import Button from '$lib/base/Button.svelte';

	const searchId = readable(new URLSearchParams(globalThis.location?.search).get('id'));

	const room = createQuery({
		queryKey: ['room', $searchId],
		queryFn: () => {
			if ($searchId == null) throw { message: 'ID undefined' };
			return authed({
				method: 'GET',
				route: '/room',
				params: { id: $searchId },
			});
		},
		retry(failureCount, error) {
			return !('data' in error && error.data === 'NOT_IN_ROOM' && failureCount < 2);
		},
	});

	const joinRoom = createMutation({
		mutationFn: async () => {
			if ($searchId == null) throw { message: 'ID undefined' };
			const result = await authed({
				method: 'PUT',
				route: '/room',
				params: { id: $searchId },
			});
			useQueryClient().setQueryData(['room', $searchId], result);
			return result;
		},
	});

	const startGame = createMutation({
		mutationFn: async () => {
			if ($searchId == null) throw { message: 'ID undefined' };
			const result = await authed({
				method: 'POST',
				route: '/game',
				params: { id: $searchId },
			});
			window.location.href = `/game?id=${result.data.id}`;
			return result;
		},
	});
</script>

<svelte:head>
	<title>New Splendor room</title>
	<meta name="description" content="You have been invited to a new room. Click to join the fun!" />
</svelte:head>

<Background card={cardFromId(143)} />

<div class="z-30 flex flex-col items-center justify-center w-full h-screen">
	<div class="flex flex-col p-2 m-2 rounded-md shadow md:p-4 bg-slate-50">
		{#if !$isLoggedIn}
			<Login onSuccess={() => {}} />
		{/if}
		{#if $room.isError}
			{#if 'data' in $room.error && $room.error.data === 'NOT_IN_ROOM'}
				<span class="text-2xl mb-2">You are not in this room!</span>
				<Button loading={$joinRoom.isPending} onClick={() => $joinRoom.mutate()}>
					Join the room
				</Button>
			{:else if $room.error?.message !== 'Unauthorized'}
				<span class="text-red-500">{$room.error.message}</span>
			{/if}
		{/if}
		{#if $room.isSuccess && $room.data.data != null}
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
					<Button onClick={() => $startGame.mutate()} loading={$startGame.isPending} class="mt-2">
						Start the game
					</Button>
				{/if}
			</div>
		{:else if $room.isSuccess}
			Game doesn't exist
			<Button onClick={window.history.back} class="mt-2">Go back</Button>
		{/if}
	</div>
</div>
