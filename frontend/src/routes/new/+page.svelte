<script lang="ts">
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { timeAgo } from '$lib/timeAgo';
	import Spinner from '$lib/Spinner.svelte';
	import { authed, isLoggedIn, loginRegister, logout, user } from '$lib/main';
	import { readable } from 'svelte/store';

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
	});
</script>

<svelte:head>
	<title>New Splendor room</title>
	<meta name="description" content="You have been invited to a new room. Click to join the fun!" />
</svelte:head>

<div class="flex flex-col items-center justify-center">
	{#if $room.isLoading}
		<div class="p-8">
			<Spinner />
		</div>
	{/if}
	{#if $room.isSuccess && $room.data.data != null}
		<div class="max-w-md">
			<p>
				{$room.data.data.id}
				{timeAgo($room.data.data.createdAt)}
			</p>
		</div>
	{:else if $room.isError && $room.error.message !== 'Unauthorized'}
		<span class="text-red-500">{$room.error.message}</span>
	{/if}
</div>
