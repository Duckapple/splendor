<script lang="ts">
	export let size: 'xl' | 'md';

	const sizeClass = size === 'xl' ? 'text-xl w-7 h-7' : '';
</script>

<div class="group relative font-bold text-center border-2 border-gray-700 rounded-full {sizeClass}">
	<span class="cursor-default">i</span>
	<div
		class="absolute left-0 z-50 hidden p-2 text-base text-left bg-white border rounded-md top-full group-hover:block min-w-72"
	>
		<slot />
	</div>
</div>
