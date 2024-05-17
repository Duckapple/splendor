<script lang="ts">
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { timeAgo } from '$lib/timeAgo';
	import Spinner from '$lib/Spinner.svelte';
	import { authed, isLoggedIn, user } from '$lib/main';
	import { readable } from 'svelte/store';
	import Background from '$lib/compose/Background.svelte';
	import { cardFromId } from '../../../../common/defaults';
	import Login from '$lib/Login.svelte';
	import { isHttpError } from '@sveltejs/kit';

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
		retry(_failureCount, error) {
			return !('data' in error && error.data === 'NOT_IN_ROOM');
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
				<span class="text-2xl">You are not in this room!</span>
				<button
					class="p-1 mt-2 border border-black rounded md:px-2 md:text-lg"
					on:click={() => $joinRoom.mutate()}
				>
					{#if $joinRoom.isPending}
						<Spinner />
					{/if}
					Join the room</button
				>
			{:else if $room.error?.message !== 'Unauthorized'}
				<span class="text-red-500">{$room.error.message}</span>
			{/if}
		{/if}
		{#if $room.isSuccess && $room.data.data != null}
			<div class="max-w-md">
				<p>
					Opened {timeAgo($room.data.data.createdAt)}
				</p>
				Players:
				<ul class="pl-6 list-disc">
					{#each $room.data.data.players as player}
						<li>{player.userName}</li>
					{/each}
				</ul>
				{#if $room.data.data.ownerId === $user?.id}
					<button
						class="p-1 mt-2 border border-black rounded md:px-2 md:text-lg"
						on:click={() => $startGame.mutate()}
					>
						{#if $joinRoom.isPending}
							<Spinner />
						{/if}
						Start the game</button
					>
				{/if}
			</div>
		{/if}
	</div>
</div>
