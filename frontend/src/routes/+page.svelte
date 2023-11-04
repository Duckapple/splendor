<script>
	import Counter from './Counter.svelte';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="flex flex-col justify-center items-center flex-[0.6]">
	<h2>
		try editing the <strong>src/routes/+page.svelte</strong> file
	</h2>

	<Counter />
</section>
