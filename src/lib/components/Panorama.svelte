<script lang="ts">
	import { onMount } from "svelte";

	let panoContainer: HTMLDivElement;
	let pano: google.maps.StreetViewPanorama | undefined = undefined;

	let {
		position,
		blurred,
		move,
		pan,
		zoom
	}: {
		position: google.maps.LatLng | google.maps.LatLngLiteral;
		blurred: boolean;
		move: boolean;
		pan: boolean;
		zoom: boolean;
	} = $props();

	onMount(() => {
		// Initialise panorama
		pano = new google.maps.StreetViewPanorama(panoContainer, {
			position,
			addressControl: false,
			showRoadLabels: false,
			panControlOptions: {
				position: google.maps.ControlPosition.LEFT_CENTER
			},
			zoomControlOptions: {
				position: google.maps.ControlPosition.LEFT_CENTER
			},
			motionTracking: false,
			motionTrackingControl: false,
			fullscreenControl: false,
			// Vision controls
			linksControl: move,
			clickToGo: move,
			panControl: pan,
			zoomControl: zoom,
			scrollwheel: zoom,
			disableDoubleClickZoom: !zoom
		});
		pano.setZoom(0);
		pano.setPov(pano.getPhotographerPov());

		setTimeout(() => {
			// Un-invert colours and dismiss warning when API key is invalid or exhausted
			const canvas = document.querySelector(".mapsImagerySceneScene__canvas") as HTMLCanvasElement;
			if (canvas && canvas.style.filter == "invert(1)") {
				(document.querySelector(".mapsImagerySceneScene__root")! as HTMLDivElement).style.filter =
					"invert(1)";
				(
					document
						.evaluate(
							"//div[text() = 'For development purposes only']",
							document,
							null,
							XPathResult.ANY_TYPE,
							null
						)
						.iterateNext()! as HTMLDivElement
				).style.display = "none";
				(document.querySelectorAll(".dismissButton")! as NodeListOf<HTMLButtonElement>).forEach(
					(element) => element.click()
				);
			}
		}, 500);
	});

	// Update panorama when props change
	$effect(() => {
		if (pano) pano.setPosition(position);
	});
	$effect(() => {
		if (pano) pano.setOptions({ linksControl: move, clickToGo: move });
	});
	$effect(() => {
		if (pano) pano.setOptions({ panControl: pan });
	});
	$effect(() => {
		if (pano)
			pano.setOptions({ zoomControl: zoom, scrollwheel: zoom, disableDoubleClickZoom: !zoom });
	});
</script>

<div
	bind:this={panoContainer}
	class="h-screen"
	class:blur-lg={blurred}
	class:pointer-events-none={blurred || !pan}
></div>
