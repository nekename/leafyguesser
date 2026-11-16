<script lang="ts">
	import favicon from "#lib/assets/favicon.svg";
	import Map from "#lib/components/Map.svelte";
	import Panorama from "#lib/components/Panorama.svelte";
	import ResultsView from "#lib/components/ResultsView.svelte";
	import Setup from "#lib/components/Setup.svelte";

	import { importLibraries, librariesImported } from "#lib/googlemaps.ts";
	import { chooseLocation } from "#lib/location.ts";
	import { createGame, joinGame } from "#lib/peer.ts";
	import type { HostboundData, PlayerboundData, Position } from "#lib/types.ts";
	import { getPoints, stringToColour } from "#lib/utils.ts";

	import { browser } from "$app/env";

	import type { DataConnection } from "peerjs";
	import Peer from "peerjs";

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
	let guess = $state<Position | undefined>(undefined);
	let confirmed = $state(false);
	let otherPlayers = $state<{ name: string; colour: string; position: Position }[]>([]);
	let points = $state<{ [name: string]: number }>({});

	let peer: Peer | null = $state(null);
	let connections: DataConnection[] = $state([]);

	function onHostboundData(player: string, data: HostboundData) {
		if (data.type == "guess") {
			otherPlayers.push({
				name: player,
				colour: stringToColour(player),
				position: data.payload
			});
			points[player] ??= 0;
			points[player] += getPoints(data.payload, position);
			if (confirmed && connections.length == otherPlayers.length) displayMode = "results";
		}
	}
	function onPlayerboundData(data: PlayerboundData) {
		if (data.type == "error") {
			joinState = { state: "error", message: data.payload.message };
		} else if (data.type == "settings") {
			move = data.payload.move;
			pan = data.payload.pan;
			zoom = data.payload.zoom;
			mapProvider = data.payload.mapProvider;
		} else if (data.type == "stage") {
			if (data.payload.value == "setup" || data.payload.value == "play") {
				position = data.payload.position;
				guess = undefined;
				confirmed = false;
			} else if (data.payload.value == "results") {
				otherPlayers = data.payload.otherPlayers;
				points = data.payload.points;
			}
			displayMode = data.payload.value;
		}
	}

	$effect(() => {
		if (hosting && !gameCode) {
			createGame()
				.then((p) => {
					peer = p;
					gameCode = peer.id;
					peer.on("connection", (c) => {
						c.on("open", () => {
							if (displayMode != "setup") {
								c.send({
									type: "error",
									payload: { message: "Game already started" }
								} as PlayerboundData);
								c.close();
								return;
							}
							connections.push(c);
							c.on("data", (data) => onHostboundData(c.peer, data as HostboundData));
						});
						const cleanup = () => {
							connections = connections.filter((conn) => conn.peer != c.peer);
							otherPlayers = otherPlayers.filter((p) => p.name != c.peer);
							if (displayMode == "play" && confirmed && connections.length == otherPlayers.length) {
								displayMode = "results";
							}
						};
						c.on("close", cleanup);
						c.on("error", cleanup);
					});
				})
				.catch(() => {
					gameCode = "Failed";
				});
		}
	});
	$effect(() => {
		if (hosting && peer && displayMode == "setup") {
			for (const c of connections) {
				c.send({
					type: "settings",
					payload: {
						move,
						pan,
						zoom,
						mapProvider
					}
				} as PlayerboundData);
			}
		}
	});
	$effect(() => {
		if (hosting && peer && (displayMode == "setup" || displayMode == "play")) {
			for (const c of connections) {
				c.send({
					type: "stage",
					payload: {
						value: displayMode,
						position: position
					}
				} as PlayerboundData);
			}
		}
	});
	$effect(() => {
		if (hosting && peer && displayMode == "results") {
			for (const c of connections) {
				c.send({
					type: "stage",
					payload: {
						value: displayMode,
						otherPlayers: [
							...(confirmed
								? [{ name: "Host", colour: stringToColour("Host"), position: guess }]
								: []),
							...otherPlayers.filter((p) => p.name != c.peer)
						],
						points
					}
				} as PlayerboundData);
			}
		}
	});

	let joinState = $state<
		{ state: "idle" | "joining" | "joined" } | { state: "error"; message: string }
	>({ state: "idle" });
	function join() {
		if (!gameCode) return;
		let code = gameCode.toString();
		if (code.length < 6) code = code.padStart(6, "0");
		else if (code.length > 6) return;

		joinState = { state: "joining" };
		joinGame(code)
			.then(([p, c]) => {
				joinState = { state: "joined" };
				peer = p;
				connections.push(c);
				c.on("data", (data) => onPlayerboundData(data as PlayerboundData));
				c.on("close", () => {
					if (joinState.state != "error") {
						joinState = { state: "error", message: "Connection closed by host" };
					}
					displayMode = "setup";
				});
			})
			.catch((error) => {
				joinState = { state: "error", message: error.message };
			});
	}

	function confirm() {
		if (displayMode == "setup") {
			if (hosting) proceed();
			else if (joinState.state == "idle") join();
			else if (joinState.state == "error") {
				peer?.destroy();
				peer = null;
				connections = [];
				joinState = { state: "idle" };
				gameCode = undefined;
			}
		} else if (displayMode == "play" && guess) {
			confirmed = true;
			if (hosting) {
				points["Host"] ??= 0;
				points["Host"] += getPoints(guess, position);
				if (connections.length == otherPlayers.length) displayMode = "results";
			} else if (hosting == false) {
				connections[0].send({ type: "guess", payload: guess } as HostboundData);
			}
		}
	}
	function proceed() {
		displayMode = "play";
		guess = undefined;
		confirmed = false;
		otherPlayers = [];
		chooseLocation().then((loc) => (position = loc));
	}
</script>

{#if $librariesImported && position}
	<Panorama {position} blurred={displayMode == "results"} {move} {pan} {zoom} />
	<Map
		{mapProvider}
		{displayMode}
		buttonText={displayMode == "setup"
			? hosting
				? gameCode
					? "Start game"
					: "Loading..."
				: hosting == false
					? joinState.state == "idle"
						? "Join game"
						: joinState.state == "joining"
							? "Joining..."
							: joinState.state == "joined"
								? "Waiting for host..."
								: joinState.state == "error"
									? "Go back"
									: null
					: null
			: displayMode == "play"
				? !confirmed
					? "Guess"
					: "Waiting for other players..."
				: null}
		buttonDisabled={displayMode == "setup"
			? hosting
				? !gameCode || gameCode.toString().length > 6
				: hosting == false
					? joinState.state == "idle"
						? !gameCode
						: joinState.state == "joining" || joinState.state == "joined"
					: true
			: displayMode == "play"
				? confirmed || !guess
				: displayMode == "results"}
		actual={position}
		bind:guess
		{otherPlayers}
		{confirm}
	/>

	{#if hosting != undefined && displayMode == "results"}
		<ResultsView
			{hosting}
			{proceed}
			name={hosting ? "Host" : peer!.id}
			actual={position}
			{guess}
			{otherPlayers}
			{points}
		/>
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

	{#if displayMode == "setup" && joinState.state != "joined"}
		<Setup
			bind:hosting
			bind:gameCode
			{joinState}
			{join}
			bind:move
			bind:pan
			bind:zoom
			bind:mapProvider
		/>
	{/if}
</div>
