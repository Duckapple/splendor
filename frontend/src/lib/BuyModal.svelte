<script lang="ts">
	import { Color } from '../../../common/model';
	import { only } from '../../../common/filter-utils';
	import Counter from '../routes/Counter.svelte';
	import Modal from './Modal.svelte';
	export let closeModal: () => void;
	export let open: boolean;
</script>

<Modal bind:closeModal bind:open>
	<div class="flex justify-between gap-2">
		{#each Object.values(Color).filter(only('number')) as color}
			<Counter bind:color />
		{/each}
	</div>
</Modal>
