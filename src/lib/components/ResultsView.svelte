<script lang="ts">
	let { proceed }: { proceed: () => void } = $props();
</script>

<div
	class="fixed top-[calc(45%+18rem)] left-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
>
	<button
		onclick={proceed}
		class="text-md w-[calc(100%-2rem)] cursor-pointer rounded-md bg-green-800 p-2 font-semibold text-white sm:w-3xl!"
	>
		Continue
	</button>
</div>
