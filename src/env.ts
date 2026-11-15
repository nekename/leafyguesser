import { defineEnvVars } from "@sveltejs/kit/env";

export const variables = defineEnvVars({
	GOOGLE_MAPS_API_KEY: { public: true },
	MAPBOX_ACCESS_TOKEN: { public: true },
	PEERJS_HOST: { public: true },
	PEERJS_KEY: { public: true },
	REALTIME_TURN_TOKEN_ID: {},
	REALTIME_TURN_API_TOKEN: {}
});
