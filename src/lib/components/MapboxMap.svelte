<script lang="ts">
	import "mapbox-gl/dist/mapbox-gl.css";
	import * as mapboxgl from "mapbox-gl/esm";

	import { MAPBOX_ACCESS_TOKEN } from "$app/env/public";
	import { onMount } from "svelte";

	let {
		width,
		height,
		onclick
	}: { width: string; height: string; onclick: (position: mapboxgl.LngLat) => void } = $props();

	let mapContainer: HTMLDivElement;
	let map: mapboxgl.Map;

	let markers: {
		actual: mapboxgl.Marker | undefined;
		guess: mapboxgl.Marker | undefined;
		otherPlayers: mapboxgl.Marker[];
	} = {
		actual: undefined,
		guess: undefined,
		otherPlayers: []
	};
	const markerColours = new WeakMap<mapboxgl.Marker, string>();
	let lines: string[] = [];

	function removeLines() {
		for (const lineId of lines) {
			if (map.getLayer(lineId)) {
				map.removeLayer(lineId);
			}
			if (map.getSource(lineId)) {
				map.removeSource(lineId);
			}
		}
		lines = [];
	}

	function drawLines() {
		if (!markers.actual || !markers.actual.getLngLat()) return;
		removeLines();

		lines = [...(markers.guess ? [markers.guess] : []), ...markers.otherPlayers].flatMap(
			(marker) => {
				if (!marker.getLngLat()) return [];
				const lineId = `line-${Math.random()}`;
				map.addLayer({
					id: lineId,
					type: "line",
					source: {
						type: "geojson",
						data: {
							type: "Feature",
							geometry: {
								type: "LineString",
								coordinates: [
									[marker.getLngLat().lng, marker.getLngLat().lat],
									[markers.actual!.getLngLat().lng, markers.actual!.getLngLat().lat]
								]
							}
						}
					},
					layout: {},
					paint: {
						"line-color": markerColours.get(marker) || "hsl(0, 100%, 63%)",
						"line-opacity": 0.7,
						"line-width": 3
					}
				});
				return lineId;
			}
		);
	}

	export function putMarker(
		position: mapboxgl.LngLat | mapboxgl.LngLatLike,
		type: "actual" | "guess" | "otherPlayer",
		colour: string
	) {
		const span = document.createElement("span");
		span.innerHTML = type == "actual" ? "\ue153" : type == "guess" ? "\ue837" : "\ue853";
		Object.assign(span.style, {
			position: "absolute",
			top: "4px",
			left: "50%",
			transform: "translateX(-45%)",
			fontFamily: "'Material Icons'",
			fontSize: "8px",
			color: colour
		});
		const marker = new mapboxgl.Marker({ color: colour }).setLngLat(position).addTo(map);
		marker.getElement().appendChild(span);
		markerColours.set(marker, colour);

		if (type == "actual") {
			markers.actual?.remove();
			markers.actual = marker;
			map.setCenter(position);
			map.setZoom(2.5);
			drawLines();
		} else if (type == "guess") {
			markers.guess?.remove();
			markers.guess = marker;
		} else if (type == "otherPlayer") {
			markers.otherPlayers.push(marker);
		}
	}

	export function resetMap() {
		removeLines();
		markers.actual?.remove();
		markers.guess?.remove();
		for (const marker of markers.otherPlayers) {
			marker.remove();
		}
		markers = { actual: undefined, guess: undefined, otherPlayers: [] };

		map.setCenter([0, 0]);
		map.setZoom(1);
	}

	onMount(() => {
		map = new mapboxgl.Map({
			accessToken: MAPBOX_ACCESS_TOKEN,
			container: mapContainer,
			center: [0, 0],
			style: "mapbox://styles/mapbox/streets-v12",
			zoom: 1
		});

		map.on("click", (event) => onclick(event.lngLat));
	});

	$effect(() => {
		void width;
		void height;
		map?.resize();
	});
</script>

<div
	bind:this={mapContainer}
	class="shrink-0 overflow-hidden rounded-md"
	style="width: {width}; height: {height};"
></div>
