// https://stackoverflow.com/a/16348977/14269655
export function stringToColour(str: string) {
	let hash = 0;
	str.split("").forEach((char) => {
		hash = char.charCodeAt(0) + ((hash << 5) - hash);
	});
	let colour = "#";
	for (let i = 0; i < 3; i++) {
		const value = (hash >> (i * 8)) & 0xff;
		colour += value.toString(16).padStart(2, "0");
	}
	return colour;
}

function deg2rad(deg: number) {
	return deg * (Math.PI / 180);
}

export function getDistanceFromLatLngInKm(
	{ lat: lat1, lng: lng1 }: { lat: number; lng: number },
	{ lat: lat2, lng: lng2 }: { lat: number; lng: number }
) {
	// Use the Haversine formula to calculate the distance between two coordinates.
	const a =
		Math.sin(deg2rad(lat2 - lat1) / 2) ** 2 +
		Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(deg2rad(lng2 - lng1) / 2) ** 2;
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return 6371 /* radius of the Earth */ * c;
}

export function getPoints(
	loc1: { lat: number; lng: number } | null,
	loc2: { lat: number; lng: number } | null
) {
	if (!loc1 || !loc2) return 0;
	const distance = getDistanceFromLatLngInKm(loc1, loc2);
	if (distance < 0.2) return 5000;
	return Math.floor(5000 * Math.E ** (-distance / 2000));
}
