<script>
	import Counter from './Counter.svelte';
	import { authed, isLoggedIn, loginRegister, logout, user } from '$lib/main';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import ArbitraryData from '$lib/ArbitraryData.svelte';
	import { timeAgo } from '$lib/timeAgo';
	$: userName = '';
	$: password = '';
	$: register = false;
	const pw = 'password';

	const loginMutation = createMutation({
		mutationKey: ['login'],
		mutationFn: () => {
			return loginRegister({ userName, password }, register);
		},
	});

	const rooms = createQuery({
		queryKey: ['rooms'],
		queryFn: async () => {
			const result = await authed({
				method: 'GET',
				route: '/room',
			});
			console.log(result);
			return result;
		},
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="flex flex-col justify-center items-center flex-[0.6]">
	{#if isLoggedIn && $rooms.isSuccess}
		<div class="flex flex-col gap-4">
			{#each $rooms.data.data as room}
				<a class="block p-2 border border-gray-700" href={`/game?id=${room.id}`}>
					<p>
						{room.id}
						{#if room.started} - started{/if}
					</p>
					<p>
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
	{/if}

	{#if !$isLoggedIn}
		<form on:submit|preventDefault={() => $loginMutation.mutate()} class="flex flex-col">
			<label for="userName">User name</label>
			<input class="p-1 rounded" type="text" name="userName" id="userName" bind:value={userName} />
			<label for="password">Password</label>
			<input class="p-1 rounded" type="password" name={pw} id={pw} bind:value={password} />
			{#if $loginMutation.error}
				<span class="text-red-500">{$loginMutation.error?.message}</span>
			{/if}
			<div class="flex gap-2">
				<button
					class="flex-grow p-1 mt-2 border border-black rounded"
					on:click={() => (register = true)}
					type="submit"
				>
					Register
				</button>
				<button
					class="flex-grow p-1 mt-2 border border-black rounded"
					on:click={() => (register = false)}
					type="submit"
				>
					Log in
				</button>
			</div>
		</form>
	{:else}
		<button class="p-1 border border-black rounded" on:click={() => logout()}
			>Log out of {$user?.userName}</button
		>
	{/if}

	<Counter />
</section>

<ArbitraryData />
