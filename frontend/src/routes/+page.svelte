<script lang="ts">
	import { client, isLoggedIn, logout, user } from '$lib/main';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { timeAgo } from '$lib/timeAgo';
	import Spinner from '$lib/Spinner.svelte';
	import Background from '$lib/compose/Background.svelte';
	import Login from '$lib/Login.svelte';
	import Button from '$lib/base/Button.svelte';

	function tap<T>(t: T) {
		console.log(t);
		return t;
	}

	const rooms = createQuery({
		queryKey: ['rooms'],
		queryFn: () => client.room.index.get(),
	});

	const createRoom = createMutation({
		mutationKey: ['rooms'],
		mutationFn: async () => {
			const data = await client.room.index.post();
			if (!data.data?.id) throw { message: 'Failed to create room' };

			window.location.href = `/new?id=${data.data.id}`;
		},
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<Background />

<section class="z-50 flex flex-col justify-center items-center flex-[0.6]">
	<div class="p-2 m-2 rounded-md shadow md:p-4 bg-slate-50">
		<h1 class="pb-6 text-7xl md:text-8xl">Splendor</h1>
		{#if $isLoggedIn && $rooms.isLoading}
			<div class="p-8 flex justify-center">
				<Spinner />
			</div>
		{/if}
		{#if $isLoggedIn && $rooms.isSuccess}
			<div class="flex flex-col gap-4 pb-2 text-lg md:">
				{#each $rooms.data?.data ?? [] as room}
					<a
						class="relative block p-2 border rounded border-slate-500"
						href={`/${room.started ? 'game' : 'new'}?id=${room.id}`}
					>
						{#if room.started}
							<span class="absolute right-2 bottom-2">started</span>
						{/if}
						<p title="Updated {timeAgo(room.updatedAt)} ({room.updatedAt.toString()})">
							Created by {room.players.find(({ userId }) => room.ownerId === userId)?.userName}
							{timeAgo(room.createdAt)}
						</p>
						Players:
						<ul class="pl-6 list-disc">
							{#each room.players as player}
								<li>{player.userName}</li>
							{/each}
						</ul>
					</a>
				{:else}
					<p class="text-center">No rooms found</p>
				{/each}
			</div>
		{:else if $rooms.isError && $rooms.error.message !== 'Unauthorized'}
			<span class="text-red-500">{$rooms.error.message}</span>
		{/if}
		{#if !$isLoggedIn}
			<Login onSuccess={() => void $rooms.refetch()} />
		{:else}
			<div class="flex justify-stretch gap-2 mt-2">
				<Button onClick={() => $createRoom.mutate()} loading={$createRoom.isPending}>
					Create new room
				</Button>
				<Button onClick={() => logout()}>Log out of {$user?.userName}</Button>
			</div>
		{/if}
	</div>
</section>
