<script lang="ts">
	import favicon from "#lib/assets/favicon.svg";
	import Map from "#lib/components/Map.svelte";
	import Panorama from "#lib/components/Panorama.svelte";
	import ResultsView from "#lib/components/ResultsView.svelte";
	import Setup from "#lib/components/Setup.svelte";

	import { importLibraries, librariesImported } from "#lib/googlemaps.ts";
	import { chooseLocation } from "#lib/location.ts";
	import type { Position } from "#lib/types.ts";

	import { browser } from "$app/env";

	if (browser) importLibraries();

	let hosting = $state(undefined),
		gameCode: string | number | undefined = $state(undefined),
		move = $state(true),
		pan = $state(true),
		zoom = $state(true),
		mapProvider = $state<"google" | "mapbox">("mapbox");

	let position = $state<Position | null>(null);
	$effect(() => {
		if ($librariesImported && !position) {
			chooseLocation().then((loc) => (position = loc));
		}
	});

	let displayMode = $state<"setup" | "play" | "results">("setup");
	function confirm() {
		if (displayMode == "setup") {
			proceed();
		} else {
			displayMode = "results";
		}
	}
	function proceed() {
		displayMode = "play";
		chooseLocation().then((loc) => (position = loc));
	}
</script>

{#if $librariesImported && position}
	<Panorama {position} blurred={displayMode == "results"} {move} {pan} {zoom} />
	<Map
		{mapProvider}
		{displayMode}
		buttonText={displayMode == "setup"
			? hosting == true
				? "Start game"
				: hosting == false
					? "Join game"
					: null
			: "Guess"}
		actual={position}
		otherPlayers={[]}
		{confirm}
	/>

	{#if displayMode == "results"}
		<ResultsView {proceed} />
	{/if}
{/if}

<div
	class="absolute top-0 right-0 z-10 flex flex-col space-y-2 rounded-bl-lg p-2 backdrop-blur-2xl"
>
	<div class="flex flex-row items-center justify-end space-x-1">
		<h1
			class="text-xl font-bold text-green-800 [text-shadow:-0.5px_-0.5px_0_#16a34a,0.5px_-0.5px_0_#16a34a,-0.5px_0.5px_0_#16a34a,0.5px_0.5px_0_#16a34a]"
		>
			Leafyguesser
		</h1>
		<img src={favicon} alt="Leafyguesser logo" class="h-6 w-auto" />
	</div>

	{#if displayMode == "setup"}
		<Setup bind:hosting bind:gameCode bind:move bind:pan bind:zoom bind:mapProvider />
	{/if}
</div>
