<script lang="ts">
	import GoogleMap from "#lib/components/GoogleMap.svelte";
	import MapboxMap from "#lib/components/MapboxMap.svelte";

	import type { Position } from "#lib/types.ts";

	let {
		mapProvider,
		displayMode,
		buttonText,
		actual,
		guess = $bindable(),
		otherPlayers,
		confirm
	}: {
		mapProvider: "google" | "mapbox";
		displayMode: "setup" | "play" | "results";
		buttonText: string | null;
		actual: Position;
		guess?: Position;
		otherPlayers: { colour: string; position: Position }[];
		confirm: () => void;
	} = $props();

	let googleMap: GoogleMap | undefined = $state(undefined);
	let mapboxMap: MapboxMap | undefined = $state(undefined);

	function putMarker(position: Position, type: "actual" | "guess" | "otherPlayer", colour: string) {
		if (mapProvider == "google") {
			googleMap?.putMarker(position, type, colour);
		} else {
			mapboxMap?.putMarker(position, type, colour);
		}
	}

	function resetMap() {
		if (mapProvider == "google") {
			googleMap?.resetMap();
		} else {
			mapboxMap?.resetMap();
		}
	}

	$effect(() => {
		if (displayMode == "setup" || displayMode == "results") {
			for (const otherPlayer of otherPlayers) {
				putMarker(otherPlayer.position, "otherPlayer", otherPlayer.colour);
			}
			if (actual) putMarker(actual, "actual", "hsl(0, 100%, 63%)");
		} else {
			resetMap();
		}
	});

	function onMapClick(position: Position) {
		if (displayMode == "play") {
			putMarker(position, "guess", "hsl(0, 100%, 63%)");
		}
	}

	const playMapClasses =
		"right-0 bottom-0 m-4 sm:m-6 sm:w-[20rem]! h-[12rem] " +
		"sm:hover:w-[40rem]! hover:h-[18rem] sm:hover:h-[24rem]!";

	const resultsMapClasses =
		"left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 md:w-[48rem]! h-[32rem]";
</script>

<div
	class={[
		"absolute z-20 flex w-[calc(100%-2rem)] items-center justify-center overflow-hidden rounded-md transition-all duration-200",
		displayMode == "results" ? resultsMapClasses : playMapClasses
	]}
>
	{#if mapProvider == "google"}
		<GoogleMap
			bind:this={googleMap}
			onclick={onMapClick}
			width={displayMode == "results" ? "48rem" : "40rem"}
			height={displayMode == "results" ? "32rem" : "24rem"}
		/>
	{:else}
		<MapboxMap
			bind:this={mapboxMap}
			onclick={onMapClick}
			width={displayMode == "results" ? "48rem" : "40rem"}
			height={displayMode == "results" ? "32rem" : "24rem"}
		/>
	{/if}

	{#if buttonText && (displayMode == "setup" || displayMode == "play")}
		<button
			onclick={confirm}
			class="text-md absolute bottom-0 z-20 w-full cursor-pointer rounded-b-md bg-green-800 p-2 font-semibold text-white"
		>
			{buttonText}
		</button>
	{/if}
</div>
