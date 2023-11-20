<script>
	import { cards } from '../../../../common/defaults';
	import Person from './Person.svelte';
</script>

<div class="flex flex-wrap gap-2 md:gap-4">
	{#each cards.persons as card}
		<Person {card} />
	{/each}
</div>
