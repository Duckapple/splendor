<script>
	import { authed, isLoggedIn, loginRegister, logout, user } from '$lib/main';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { timeAgo } from '$lib/timeAgo';
	import Spinner from '$lib/Spinner.svelte';
	import Background from '$lib/compose/Background.svelte';
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
			const data = await authed({
				method: 'POST',
				route: '/room',
			});
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
			<div class="p-8">
				<Spinner />
			</div>
		{/if}
		{#if $isLoggedIn && $rooms.isSuccess}
			<div class="flex flex-col gap-4 pb-2 text-lg md:">
				{#each $rooms.data.data as room}
					<a
						class="relative block p-2 border border-gray-700"
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
				class="p-1 mt-2 border border-black rounded md:px-2 md:text-lg"
				on:click|preventDefault={() => $createRoom.mutate()}>Create new room</button
			>
			<button class="p-1 border border-black rounded md:px-2 md:text-lg" on:click={() => logout()}
				>Log out of {$user?.userName}</button
			>
		{/if}
	</div>
</section>
