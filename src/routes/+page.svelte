<script lang="ts">
	import Panorama from "#lib/components/Panorama.svelte";

	import { importLibraries, librariesImported } from "#lib/googlemaps.ts";

	import { browser } from "$app/env";

	if (browser) importLibraries();

	let move = $state(true),
		pan = $state(true),
		zoom = $state(true);
	$effect(() => {
		if (!pan) {
			move = false;
			zoom = false;
		}
	});
</script>

{#if $librariesImported}
	<Panorama position={{ lat: 51.500786, lng: -0.124681 }} blurred={false} {move} {pan} {zoom} />
{/if}

<div class="absolute top-4 right-4 z-10">
	<input type="checkbox" bind:checked={move} disabled={!pan} /> Move
	<input type="checkbox" bind:checked={pan} /> Pan
	<input type="checkbox" bind:checked={zoom} disabled={!pan} /> Zoom
</div>
