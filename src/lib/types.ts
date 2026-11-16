export type Position = { lat: number; lng: number };

export type PlayerboundData =
	| { type: "error"; payload: { message: string } }
	| {
			type: "settings";
			payload: { move: boolean; pan: boolean; zoom: boolean; mapProvider: "google" | "mapbox" };
	  }
	| {
			type: "stage";
			payload:
				| {
						value: "setup";
						position: Position;
				  }
				| {
						value: "play";
						position: Position;
				  }
				| {
						value: "results";
						otherPlayers: {
							name: string;
							colour: string;
							position: Position;
						}[];
						points: { [name: string]: number };
				  };
	  };

export type HostboundData = {
	type: "guess";
	payload: Position;
};
