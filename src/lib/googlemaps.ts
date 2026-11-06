/* eslint-disable */
// @ts-nocheck: Google Maps loader code

import { GOOGLE_MAPS_API_KEY } from "$app/env/public";
import { browser } from "$app/env";
import { type Writable, writable } from "svelte/store";

if (browser) {
	((g) => {
		var h,
			a,
			k,
			p = "The Google Maps JavaScript API",
			c = "google",
			l = "importLibrary",
			q = "__ib__",
			m = document,
			b = window;
		b = b[c] || (b[c] = {});
		var d = b.maps || (b.maps = {}),
			r = new Set(),
			e = new URLSearchParams(),
			u = () =>
				h ||
				(h = new Promise(async (f, n) => {
					await (a = m.createElement("script"));
					e.set("libraries", [...r] + "");
					for (k in g) {
						e.set(
							k.replace(/[A-Z]/g, (t) => "_" + t[0].toLowerCase()),
							g[k]
						);
					}
					e.set("callback", c + ".maps." + q);
					a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
					d[q] = f;
					a.onerror = () => (h = n(Error(p + " could not load.")));
					a.nonce = m.querySelector("script[nonce]")?.nonce || "";
					m.head.append(a);
				}));
		d[l]
			? console.warn(p + " only loads once. Ignoring:", g)
			: (d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)));
	})({
		key: GOOGLE_MAPS_API_KEY,
		v: "weekly"
	});
}

export const maps: Writable<google.maps.MapsLibrary> = writable(),
	streetView: Writable<google.maps.StreetViewLibrary> = writable(),
	markers: Writable<google.maps.MarkerLibrary> = writable(),
	librariesImported: Writable<boolean> = writable(false);

export async function importLibraries() {
	maps.set(await google.maps.importLibrary("maps"));
	streetView.set(await google.maps.importLibrary("streetView"));
	markers.set(await google.maps.importLibrary("marker"));
	librariesImported.set(true);
}
