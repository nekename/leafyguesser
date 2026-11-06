import { defineEnvVars } from "@sveltejs/kit/env";

export const variables = defineEnvVars({
	GOOGLE_MAPS_API_KEY: { public: true }
});
