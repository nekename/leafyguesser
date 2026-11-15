<script lang="ts">
	import LoadingBounce from "#lib/components/LoadingBounce.svelte";

	let {
		hosting = $bindable(undefined),
		gameCode = $bindable(undefined),
		move = $bindable(true),
		pan = $bindable(true),
		zoom = $bindable(true),
		mapProvider = $bindable("mapbox")
	}: {
		hosting: boolean | undefined;
		gameCode: string | number | undefined;
		move: boolean;
		pan: boolean;
		zoom: boolean;
		mapProvider: string;
	} = $props();

	$effect(() => {
		if (!pan) {
			move = false;
			zoom = false;
		}
	});
</script>

<table
	class="min-w-64 border-separate rounded-lg bg-green-800/50 font-medium text-white accent-green-700"
>
	<tbody>
		{#if hosting == undefined}
			<tr>
				<td
					class="h-32 w-32 rounded-lg! border-2 border-dashed border-green-100 hover:border-solid"
				>
					<button
						onclick={() => (hosting = true)}
						class="flex h-full w-full cursor-pointer flex-col items-center justify-center p-1"
					>
						<span style="font-family: 'Material Icons';" class="text-4xl text-green-100">
							&#xf233;
						</span>
						Create game
					</button>
				</td>
				<td
					class="h-32 w-32 rounded-lg! border-2 border-dashed border-green-100 hover:border-solid"
				>
					<button
						onclick={() => (hosting = false)}
						class="flex h-full w-full cursor-pointer flex-col items-center justify-center p-1"
					>
						<span style="font-family: 'Material Icons';" class="text-4xl text-green-100">
							&#xe145;
						</span>
						Join game
					</button>
				</td>
			</tr>
		{:else if hosting}
			<tr>
				<td class="px-2 py-1">Game code</td>
				<td class="px-2 py-1 text-right align-middle">
					<span class="inline-flex flex-col justify-center">
						{#if gameCode != undefined}
							{gameCode}
						{:else}
							<LoadingBounce />
						{/if}
					</span>
				</td>
			</tr>
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
		{:else}
			<tr>
				<td class="px-2 py-1 text-center">Enter game code</td>
			</tr>
			<tr>
				<td class="px-2 py-1 text-center">
					<input
						type="number"
						max="999999"
						bind:value={gameCode}
						class="w-full [appearance:textfield] rounded-md border border-green-100 px-2 py-1 text-center font-semibold outline-hidden [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
						placeholder={"Game code, e.g. " +
							Math.floor(Math.random() * 1000000)
								.toString()
								.padStart(6, "0")}
						onwheel={(event) => event.preventDefault()}
					/>
				</td>
			</tr>
		{/if}
	</tbody>
</table>
