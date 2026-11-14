import regionData from "./regions.json";

type Box = [south: number, west: number, north: number, east: number];
type Region = { code: string; weight: number; boxes: Box[] };

const regions = regionData as Region[];

const uniform = (min: number, max: number) => min + Math.random() * (max - min);
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

function pickWeighted<T>(items: T[], weight: (item: T) => number): T {
	let roll = Math.random() * items.reduce((sum, item) => sum + weight(item), 0);
	for (const item of items) {
		roll -= weight(item);
		if (roll <= 0) return item;
	}
	return items[items.length - 1];
}

function randomPoint(): google.maps.LatLngLiteral {
	const region = pickWeighted(regions, (r) => r.weight);
	const [south, west, north, east] = pickWeighted(
		region.boxes,
		([s, w, n, e]) => (Math.sin(toRad(n)) - Math.sin(toRad(s))) * (e - w)
	);

	return {
		lat: toDeg(Math.asin(uniform(Math.sin(toRad(south)), Math.sin(toRad(north))))),
		lng: uniform(west, east)
	};
}

async function tryPoint(
	service: google.maps.StreetViewService
): Promise<{ lat: number; lng: number } | null> {
	try {
		const { data } = await service.getPanorama({
			location: randomPoint(),
			radius: 500,
			source: google.maps.StreetViewSource.OUTDOOR,
			preference: google.maps.StreetViewPreference.NEAREST
		});

		const latLng = data.location?.latLng;
		if (!latLng) return null;

		// Third-party imagery is credited to its author rather than Google
		if (!/\bGoogle\b/i.test(data.copyright ?? "")) return null;
		if ((data.links?.length ?? 0) < 2) return null;

		return { lat: latLng.lat(), lng: latLng.lng() };
	} catch (error) {
		if ((error as { code?: string })?.code === "OVER_QUERY_LIMIT") throw error;
		return null;
	}
}

export async function chooseLocation(): Promise<{ lat: number; lng: number }> {
	const service = new google.maps.StreetViewService();

	for (let round = 0; round < 25; round++) {
		const results = await Promise.all(Array.from({ length: 4 }, () => tryPoint(service)));
		const hit = results.find((r) => r !== null);
		if (hit) return hit;
	}

	throw new Error("No official Street View location found");
}
