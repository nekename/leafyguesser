<script lang="ts">
	import type { Position } from "#lib/types.ts";
	import { getPoints } from "#lib/utils.ts";

	let {
		hosting,
		proceed,
		name,
		actual,
		guess,
		otherPlayers,
		points
	}: {
		hosting: boolean;
		proceed: () => void;
		name: string;
		actual: Position;
		guess: Position | undefined;
		otherPlayers: { name: string; colour: string; position: Position }[];
		points: { [name: string]: number };
	} = $props();

	let uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

	let players = $derived(
		[{ name, colour: "hsl(0, 100%, 63%)", position: guess }, ...otherPlayers].sort(
			(a, b) => (points[b.name] ?? 0) - (points[a.name] ?? 0)
		)
	);

	let thisRoundPoints = $derived(
		Object.fromEntries(players.map((p) => [p.name, p.position ? getPoints(p.position, actual) : 0]))
	);
	let notFirstRound = $derived(players.find((p) => points[p.name] != thisRoundPoints[p.name]));
</script>

<div
	class="fixed top-[calc(45%+18rem)] left-1/2 z-20 flex max-h-[calc(55%-18rem)] w-full -translate-x-1/2 -translate-y-3 flex-col items-center overflow-y-auto"
>
	{#if hosting}
		<button
			onclick={proceed}
			class="text-md mb-2 w-[calc(100%-2rem)] cursor-pointer rounded-md bg-green-800 p-2 font-semibold text-white md:w-3xl!"
		>
			Continue
		</button>
	{/if}

	<div class="flex flex-col space-y-2">
		{#each players as player, index (player.name)}
			<div class="flex w-[calc(100%-2rem)] flex-row items-center space-x-2 md:w-3xl!">
				<div class="h-4 w-4 rounded-full" style="background-color: {player.colour}"></div>
				<div
					class={[
						"flex w-full flex-row items-center justify-between rounded-md p-2 text-white",
						index == 0 && players.length > 1
							? "bg-yellow-500 font-semibold"
							: index == 1 && players.length > 2
								? "bg-gray-400"
								: "bg-green-700/50"
					]}
				>
					{uuidV4Regex.test(player.name) ? "Player " + player.name.split("-")[0] : player.name}
					{#if player.name == name}(You){/if}
					<span>
						{points[player.name] ?? 0}
						{points[player.name] == 1 ? "point" : "points"}
						{#if notFirstRound}
							<span class="ml-1 text-sm">
								({thisRoundPoints[player.name] > 0 ? "+" : ""}{thisRoundPoints[player.name]})
							</span>
						{/if}
					</span>
				</div>
			</div>
		{/each}
	</div>
</div>
