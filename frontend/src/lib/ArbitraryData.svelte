<script lang="ts">
	import { createMutation } from '@tanstack/svelte-query';
	import { authed } from './main';
	import Spinner from './Spinner.svelte';

	$: jsonBox = '';

	const otherMutation = createMutation({
		mutationKey: ['all'],
		mutationFn: () => {
			const data = JSON.parse(jsonBox);
			console.log(data);
			return authed(data);
		},
	});
</script>

<div class="max-w-[56rem] grid grid-cols-3 gap-4">
	<div class="col-span-2">
		<pre
			class="w-full h-64 border-4 border-gray-700 rounded-lg whitespace-break-spaces"
			contenteditable
			bind:innerText={jsonBox}
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
	<pre class="border-4 border-gray-700 rounded-lg" contenteditable>Scratchpad...</pre>
</div>
