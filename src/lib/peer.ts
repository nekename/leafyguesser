import { PEERJS_HOST, PEERJS_KEY } from "$app/env/public";

import type { DataConnection } from "peerjs";
import Peer from "peerjs";

let iceServers: RTCIceServer[] | undefined;

export async function createGame(): Promise<Peer> {
	const gameCode = Math.floor(Math.random() * 1000000)
		.toString()
		.padStart(6, "0");

	if (!iceServers) {
		iceServers = await (await fetch("/ice_servers.json")).json();
	}

	return new Promise((resolve, reject) => {
		const peer = new Peer(gameCode, {
			host: PEERJS_HOST || undefined,
			secure: true,
			key: PEERJS_KEY ? encodeURIComponent(PEERJS_KEY) : undefined,
			config: { iceServers }
		});

		peer.on("open", () => {
			resolve(peer);
		});

		peer.on("error", (error) => {
			peer.destroy();
			if (error.type === "unavailable-id") {
				createGame().then(resolve, reject);
			} else {
				reject(error);
			}
		});
	});
}

export async function joinGame(gameCode: string): Promise<[Peer, DataConnection]> {
	if (!iceServers) {
		iceServers = await (await fetch("/ice_servers.json")).json();
	}

	return new Promise((resolve, reject) => {
		const peer = new Peer({
			host: PEERJS_HOST || undefined,
			secure: true,
			key: PEERJS_KEY ? encodeURIComponent(PEERJS_KEY) : undefined,
			config: { iceServers }
		});

		peer.on("open", () => {
			const conn = peer.connect(gameCode);
			conn.on("open", () => {
				resolve([peer, conn]);
			});
			conn.on("error", (error) => {
				peer.destroy();
				reject(error);
			});
		});

		peer.on("error", (error) => {
			peer.destroy();
			reject(error);
		});
	});
}
