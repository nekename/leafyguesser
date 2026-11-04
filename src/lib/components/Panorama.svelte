<script lang="ts">
	import { type GlobalData, globalData, host, pano } from "$lib/core";
	import { streetView } from "$lib/googlemaps";
	import { chooseLocation } from "$lib/utils";

	let panoContainer: HTMLDivElement;

	export let blurred: boolean, interactable: boolean;

	$: if ($pano) {
		$pano.setPosition($globalData.actual);
	}

	export async function resetPanorama() {
		let actual = $globalData.actual;
		if ($host) {
			// Fetch closest panorama location
			actual = await chooseLocation($streetView);
			globalData.update((data: GlobalData) => ({ ...data, actual }));
		}

		// Initialise panorama
		if (!$pano) {
			$pano = new google.maps.StreetViewPanorama(
				panoContainer,
				{
					position: actual,
					addressControl: false,
					showRoadLabels: false,
					panControlOptions: {
						position: google.maps.ControlPosition.LEFT_CENTER,
					},
					zoomControlOptions: {
						position: google.maps.ControlPosition.LEFT_CENTER,
					},
					motionTracking: false,
					motionTrackingControl: false,
					fullscreenControl: false,
				},
			);
		} else {
			$pano.setPosition(actual);
		}
		$pano.setPov($pano.getPhotographerPov());

		setTimeout(() => {
			// Un-invert colours and dismiss warning when API key is invalid or exhausted
			const canvas = document.querySelector(".mapsImagerySceneScene__canvas") as HTMLCanvasElement;
			if (canvas && canvas.style.filter == "invert(1)") {
				(document.querySelector(".mapsImagerySceneScene__root")! as HTMLDivElement).style.filter = "invert(1)";
				(document.evaluate(
					"//div[text() = 'For development purposes only']",
					document,
					null,
					XPathResult.ANY_TYPE,
					null,
				).iterateNext()! as HTMLDivElement).style.display = "none";
				(document.querySelectorAll(".dismissButton")! as NodeListOf<HTMLButtonElement>).forEach((element) =>
					element.click()
				);
			}
		}, 500);
	}
</script>

<div
	bind:this={panoContainer}
	class="h-screen"
	class:blur-lg={blurred}
	class:pointer-events-none={blurred || !interactable}
/>
