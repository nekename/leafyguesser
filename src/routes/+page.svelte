<script lang="ts">
	import Map from "#lib/components/Map.svelte";
	import Panorama from "#lib/components/Panorama.svelte";
	import ResultsView from "#lib/components/ResultsView.svelte";

	import { importLibraries, librariesImported } from "#lib/googlemaps.ts";
	import { chooseLocation } from "#lib/location.ts";
	import type { Position } from "#lib/types.ts";

	import { browser } from "$app/env";

	if (browser) importLibraries();

	let move = $state(true),
		pan = $state(true),
		zoom = $state(true),
		mapProvider = $state<"google" | "mapbox">("mapbox");
	$effect(() => {
		if (!pan) {
			move = false;
			zoom = false;
		}
	});

	let position = $state<Position | null>(null);
	$effect(() => {
		if ($librariesImported && !position) {
			chooseLocation().then((loc) => (position = loc));
		}
	});

	let displayMode = $state<"play" | "results">("play");
	function confirm() {
		displayMode = "results";
	}
	function proceed() {
		displayMode = "play";
		chooseLocation().then((loc) => (position = loc));
	}
</script>

{#if $librariesImported && position}
	<Panorama {position} blurred={displayMode == "results"} {move} {pan} {zoom} />
	<Map {mapProvider} {displayMode} actual={position} otherPlayers={[]} {confirm} />

	{#if displayMode == "results"}
		<ResultsView {proceed} />
	{/if}
{/if}

<div class="absolute top-4 right-4 z-10">
	<input type="checkbox" bind:checked={move} disabled={!pan} /> Move
	<input type="checkbox" bind:checked={pan} /> Pan
	<input type="checkbox" bind:checked={zoom} disabled={!pan} /> Zoom

	<select bind:value={mapProvider}>
		<option value="google">Google</option>
		<option value="mapbox">Mapbox</option>
	</select>
</div>
