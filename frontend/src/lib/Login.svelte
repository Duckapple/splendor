<script lang="ts">
	import { loginRegister } from '$lib/main';
	import { createMutation } from '@tanstack/svelte-query';
	import Spinner from '$lib/Spinner.svelte';

	interface Props {
		onSuccess: () => void;
	}

	let { onSuccess }: Props = $props();

	let userName = $state('');

	let password = $state('');

	let register = $state(false);

	const pw = 'password';

	const loginMutation = createMutation({
		mutationKey: ['login'],
		mutationFn: async () => {
			await loginRegister({ userName, password }, register);
			onSuccess();
		},
	});
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		$loginMutation.mutate();
	}}
	class="flex flex-col"
>
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
		<span class="text-red-700">{$loginMutation.error?.message}</span>
	{/if}
	<div class="flex gap-2">
		<button
			class="flex-grow p-1 mt-2 border rounded border-slate-500"
			onclick={() => (register = true)}
			type="submit"
		>
			{#if $loginMutation.isPending && register}
				<Spinner />
			{/if}
			Register
		</button>
		<button
			class="flex-grow p-1 mt-2 border rounded border-slate-500"
			onclick={() => (register = false)}
			type="submit"
		>
			{#if $loginMutation.isPending && !register}
				<Spinner />
			{/if}
			Log in
		</button>
	</div>
</form>
