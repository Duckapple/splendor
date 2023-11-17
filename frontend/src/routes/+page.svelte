<script>
	import Counter from './Counter.svelte';
	import { isLoggedIn, login, logout } from '$lib/main';
	import { createMutation } from '@tanstack/svelte-query';
	$: userName = '';
	$: password = '';
	const pw = 'password';

	const loginMutation = createMutation({
		mutationKey: ['login'],
		mutationFn: () => {
			return login(userName, password);
		},
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="flex flex-col justify-center items-center flex-[0.6]">
	<h2>
		try editing the <strong>src/routes/+page.svelte</strong> file
	</h2>

	{#if !$isLoggedIn}
		<form on:submit|preventDefault={() => $loginMutation.mutate()} class="flex flex-col">
			<label for="userName">User name</label>
			<input class="p-1 rounded" type="text" name="userName" id="userName" bind:value={userName} />
			<label for="password">Password</label>
			<input class="p-1 rounded" type="password" name={pw} id={pw} bind:value={password} />
			{#if $loginMutation.error}<span class="text-red-500">{$loginMutation.error?.message}</span
				>{/if}
			<button class="p-1 mt-2 border border-black rounded" type="submit">Log in</button>
		</form>
	{:else}
		<button class="p-1 border border-black rounded" on:click={() => logout()}>Log out</button>
	{/if}

	<Counter />
</section>
