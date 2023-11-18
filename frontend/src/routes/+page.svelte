<script>
	import Counter from './Counter.svelte';
	import { isLoggedIn, loginRegister, logout } from '$lib/main';
	import { createMutation } from '@tanstack/svelte-query';
	import ArbitraryData from '$lib/ArbitraryData.svelte';
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
		<button class="p-1 border border-black rounded" on:click={() => logout()}>Log out</button>
	{/if}

	<Counter />
</section>

<ArbitraryData />
