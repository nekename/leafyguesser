<script lang="ts">
	let {
		move = $bindable(true),
		pan = $bindable(true),
		zoom = $bindable(true),
		mapProvider = $bindable("mapbox")
	}: { move: boolean; pan: boolean; zoom: boolean; mapProvider: string } = $props();

	$effect(() => {
		if (!pan) {
			move = false;
			zoom = false;
		}
	});
</script>

<table class="rounded-lg bg-green-800/50 font-medium text-white accent-green-700">
	<tbody>
		<tr>
			<td class="px-2 py-1">Move</td>
			<td class="float-right px-2 py-1">
				<input type="checkbox" bind:checked={move} disabled={!pan} class:cursor-pointer={pan} />
			</td>
		</tr>
		<tr>
			<td class="px-2 py-1">Pan</td>
			<td class="float-right px-2 py-1">
				<input type="checkbox" bind:checked={pan} class="cursor-pointer" />
			</td>
		</tr>
		<tr>
			<td class="px-2 py-1">Zoom</td>
			<td class="float-right px-2 py-1">
				<input type="checkbox" bind:checked={zoom} disabled={!pan} class:cursor-pointer={pan} />
			</td>
		</tr>
		<tr>
			<td class="px-2 py-1">Map</td>
			<td class="float-right px-2 py-1">
				<select bind:value={mapProvider} class="cursor-pointer text-right">
					<option value="google">Google Maps</option>
					<option value="mapbox">Mapbox</option>
				</select>
			</td>
		</tr>
	</tbody>
</table>
