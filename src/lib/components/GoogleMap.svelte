<script lang="ts">
	import { onMount } from "svelte";

	let {
		width,
		height,
		onclick
	}: {
		width: string;
		height: string;
		onclick: (position: google.maps.LatLngLiteral) => void;
	} = $props();

	let mapContainer: HTMLDivElement;
	let map: google.maps.Map;

	let markers: {
		actual: google.maps.marker.AdvancedMarkerElement | undefined;
		guess: google.maps.marker.AdvancedMarkerElement | undefined;
		otherPlayers: google.maps.marker.AdvancedMarkerElement[];
	} = {
		actual: undefined,
		guess: undefined,
		otherPlayers: []
	};
	const markerColours = new WeakMap<google.maps.marker.AdvancedMarkerElement, string>();
	let lines: google.maps.Polyline[] = [];

	function removeLines() {
		for (const line of lines) {
			line.setMap(null);
		}
		lines = [];
	}

	function drawLines() {
		if (!markers.actual || !markers.actual.position) return;
		removeLines();

		lines = [...(markers.guess ? [markers.guess] : []), ...markers.otherPlayers].flatMap(
			(marker) => {
				if (!marker.position) return [];
				return new google.maps.Polyline({
					map,
					path: [marker.position, markers.actual!.position!],
					geodesic: true,
					strokeColor: markerColours.get(marker) || "hsl(0, 100%, 63%)",
					strokeOpacity: 0.7,
					strokeWeight: 3
				});
			}
		);
	}

	export function putMarker(
		position: google.maps.LatLng | google.maps.LatLngLiteral,
		type: "actual" | "guess" | "otherPlayer",
		colour: string
	) {
		const span = document.createElement("span");
		span.style.fontFamily = "'Material Icons'";
		span.style.fontSize = "18px";
		span.innerHTML = type == "actual" ? "\ue153" : type == "guess" ? "\ue837" : "\ue853";
		const marker = new google.maps.marker.AdvancedMarkerElement({
			position: position,
			map,
			content: new google.maps.marker.PinElement({
				glyph: span,
				glyphColor: "#ffffff",
				background: colour,
				borderColor: colour
			})
		});
		markerColours.set(marker, colour);

		if (type == "actual") {
			if (markers.actual) {
				markers.actual.remove();
				markers.actual.map = null;
			}
			markers.actual = marker;
			map.setCenter(position);
			map.setZoom(4);
			drawLines();
		} else if (type == "guess") {
			if (markers.guess) {
				markers.guess.remove();
				markers.guess.map = null;
			}
			markers.guess = marker;
		} else {
			markers.otherPlayers.push(marker);
		}
	}

	export function resetMap() {
		removeLines();
		if (markers.actual) {
			markers.actual.map = null;
			markers.actual.remove();
		}
		if (markers.guess) {
			markers.guess.map = null;
			markers.guess.remove();
		}
		for (const marker of markers.otherPlayers) {
			marker.map = null;
			marker.remove();
		}
		markers = { actual: undefined, guess: undefined, otherPlayers: [] };

		map.setCenter({ lat: 0, lng: 0 });
		map.setZoom(0.6);
	}

	onMount(() => {
		map = new google.maps.Map(mapContainer, {
			center: { lat: 0, lng: 0 },
			zoom: 0.6,
			mapId: "DEMO_MAP_ID"
		});

		map.addListener("tilesloaded", () => {
			(document.querySelectorAll(".dismissButton")! as NodeListOf<HTMLButtonElement>).forEach(
				(element) => element.click()
			);
		});

		map.addListener("click", (event: google.maps.MapMouseEvent) =>
			onclick({ lat: event.latLng!.lat(), lng: event.latLng!.lng() })
		);
	});
</script>

<div
	bind:this={mapContainer}
	class="shrink-0 overflow-hidden rounded-md"
	style="width: {width}; height: {height};"
></div>
