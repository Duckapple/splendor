<script lang="ts">
	import { authed, isLoggedIn, loginRegister, logout, user } from '$lib/main';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { timeAgo } from '$lib/timeAgo';
	import Spinner from '$lib/Spinner.svelte';
	import Background from '$lib/compose/Background.svelte';

	export let onSuccess: () => void;

	$: userName = '';
	$: password = '';
	$: register = false;
	const pw = 'password';

	const loginMutation = createMutation({
		mutationKey: ['login'],
		mutationFn: async () => {
			await loginRegister({ userName, password }, register);
			onSuccess();
		},
	});
</script>

<form on:submit|preventDefault={() => $loginMutation.mutate()} class="flex flex-col">
	<label for="userName">User name</label>
	<input
		class="p-1 border rounded border-slate-500"
		type="text"
		name="userName"
		id="userName"
		bind:value={userName}
		autocomplete="username"
	/>
	<label for="password">Password</label>
	<input
		class="p-1 border rounded border-slate-500"
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
			class="flex-grow p-1 mt-2 border rounded border-slate-500"
			on:click={() => (register = true)}
			type="submit"
		>
			{#if $loginMutation.isPending && register}
				<Spinner />
			{/if}
			Register
		</button>
		<button
			class="flex-grow p-1 mt-2 border rounded border-slate-500"
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
