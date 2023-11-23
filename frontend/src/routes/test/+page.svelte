<script lang="ts">
	import { cards } from '../../../../common/defaults';
	import Person from './Person.svelte';
	import Card from './Card.svelte';
	const piles = ['high', 'middle', 'low'] as const;
</script>

<div class="flex flex-wrap gap-2 md:gap-4">
	{#each cards.persons as card}
		<Person {card} />
	{/each}
	{#each piles as pile}
		{#each cards[pile] as card}
			<Card {card} />
		{/each}
	{/each}
</div>
