<script lang="ts">
	let { hosting, proceed }: { hosting: boolean; proceed: () => void } = $props();
</script>

<div
	class="fixed top-[calc(45%+18rem)] left-1/2 z-20 flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center"
>
	{#if hosting}
		<button
			onclick={proceed}
			class="text-md w-[calc(100%-2rem)] cursor-pointer rounded-md bg-green-800 p-2 font-semibold text-white md:w-3xl!"
		>
			Continue
		</button>
	{/if}
</div>
