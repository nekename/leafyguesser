import { REALTIME_TURN_API_TOKEN, REALTIME_TURN_TOKEN_ID } from "$app/env/private";

export const GET = async () => {
	const options: { ttl: number } = { ttl: 172800 };

	const response = await fetch(
		`https://rtc.live.cloudflare.com/v1/turn/keys/${REALTIME_TURN_TOKEN_ID}/credentials/generate-ice-servers`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${REALTIME_TURN_API_TOKEN}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(options)
		}
	);

	if (!response.ok) {
		return new Response("Failed to fetch ICE servers", {
			status: 502,
			headers: { "Cache-Control": "no-store" }
		});
	}

	const data = await response.json();
	for (const server of data.iceServers) {
		if (typeof server.urls == "string") server.urls = [server.urls];
		if (!server.username) server.username = "";
		if (!server.credential) server.credential = "";
	}

	return new Response(JSON.stringify(data.iceServers), {
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "s-maxage=43200"
		}
	});
};
