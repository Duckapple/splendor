<script>
	import { authed, isLoggedIn, loginRegister, logout, user } from '$lib/main';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { timeAgo } from '$lib/timeAgo';
	import Spinner from '$lib/Spinner.svelte';
	$: userName = '';
	$: password = '';
	$: register = false;
	const pw = 'password';

	const loginMutation = createMutation({
		mutationKey: ['login'],
		mutationFn: async () => {
			await loginRegister({ userName, password }, register);
			void $rooms.refetch();
		},
	});

	const rooms = createQuery({
		queryKey: ['rooms'],
		queryFn: () => {
			return authed({
				method: 'GET',
				route: '/room',
			});
		},
	});

	const createRoom = createMutation({
		mutationKey: ['rooms'],
		mutationFn: async () => {
			await authed({
				method: 'POST',
				route: '/room',
			});
			await $rooms.refetch();
		},
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="flex flex-col justify-center items-center flex-[0.6]">
	{#if $isLoggedIn && $rooms.isLoading}
		<div class="p-8">
			<Spinner />
		</div>
	{/if}
	{#if $isLoggedIn && $rooms.isSuccess}
		<div class="flex flex-col gap-4">
			{#each $rooms.data.data as room}
				<a class="block p-2 border border-gray-700" href={`/game?id=${room.id}`}>
					<p>
						{room.id}
						{#if room.started}
							- started
						{/if}
					</p>
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
			{/each}
		</div>
	{:else if $rooms.isError && $rooms.error.message !== 'Unauthorized'}
		<span class="text-red-500">{$rooms.error.message}</span>
	{/if}

	{#if !$isLoggedIn}
		<form on:submit|preventDefault={() => $loginMutation.mutate()} class="flex flex-col">
			<label for="userName">User name</label>
			<input
				class="p-1 rounded"
				type="text"
				name="userName"
				id="userName"
				bind:value={userName}
				autocomplete="username"
			/>
			<label for="password">Password</label>
			<input
				class="p-1 rounded"
				type="password"
				name={pw}
				id={pw}
				bind:value={password}
				autocomplete="current-password"
			/>
			{#if $loginMutation.error}
				<span class="text-red-500">{$loginMutation.error?.message}</span>
			{/if}
			<div class="flex gap-2">
				<button
					class="flex-grow p-1 mt-2 border border-black rounded"
					on:click={() => (register = true)}
					type="submit"
				>
					{#if $loginMutation.isPending && register}
						<Spinner />
					{/if}
					Register
				</button>
				<button
					class="flex-grow p-1 mt-2 border border-black rounded"
					on:click={() => (register = false)}
					type="submit"
				>
					{#if $loginMutation.isPending && !register}
						<Spinner />
					{/if}
					Log in
				</button>
			</div>
		</form>
	{:else}
		<button
			class="p-1 my-2 border border-black rounded"
			on:click|preventDefault={() => $createRoom.mutate()}>Create new room</button
		>

		<button class="p-1 border border-black rounded" on:click={() => logout()}
			>Log out of {$user?.userName}</button
		>
	{/if}
	<script lang="ts">
		(async function () {
			const allowedNotifications = await window.Notification.requestPermission();
			console.log(allowedNotifications);
		});
	</script>
</section>
