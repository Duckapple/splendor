<script lang="ts">
	import { writable } from 'svelte/store';
	import { createMutation } from '@tanstack/svelte-query';
	import { authed, type AuthInput } from './main';
	import Spinner from './Spinner.svelte';

	$: method = 'POST';
	$: route = '/';
	$: params = '';
	$: body = '';

	const scratch = writable(globalThis.sessionStorage?.getItem('scratch') ?? '');
	scratch.subscribe((text) => globalThis.sessionStorage?.setItem('scratch', text));

	const otherMutation = createMutation({
		mutationKey: ['all'],
		mutationFn: () => {
			const data: AuthInput = {
				method,
				route,
			};
			if (params) {
				data.params = JSON.parse(params);
			}
			if (body) {
				data.body = JSON.parse(body);
			}
			return authed(data);
		},
	});
</script>

<div class="max-w-[56rem] grid grid-cols-3 gap-4">
	<div class="col-span-2 gap-2">
		<div>
			<label for="method">Method</label>
			<select
				class="p-1 border border-gray-700 rounded"
				id="method"
				name="method"
				bind:value={method}
			>
				<option>POST</option>
				<option>GET</option>
				<option>PUT</option>
				<option>PATCH</option>
			</select>
		</div>
		<div class="flex gap-2 mt-2">
			<label for="route">Route</label>
			<input type="text" name="route" id="route" bind:value={route} />
		</div>
		<pre
			class="w-full h-32 my-2 border-4 border-gray-700 rounded-lg whitespace-break-spaces"
			contenteditable
			bind:innerText={params}
		/>
		<pre
			class="w-full h-32 border-4 border-gray-700 rounded-lg whitespace-break-spaces"
			contenteditable
			bind:innerText={body}
		/>
		<div class="flex items-center justify-end gap-2 py-2">
			{#if $otherMutation.isPending}<Spinner />{/if}
			<button class="p-1 border border-black rounded" on:click={() => $otherMutation.mutate()}
				>Submit</button
			>
		</div>
		<pre class="w-full h-64 border-4 border-gray-700 rounded-lg">
{JSON.stringify($otherMutation.data)}
{JSON.stringify($otherMutation.error)}
      </pre>
	</div>
	<pre class="border-4 border-gray-700 rounded-lg" contenteditable bind:innerText={$scratch} />
</div>
