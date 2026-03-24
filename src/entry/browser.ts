import { aleaFromByteSource } from "../factories.js";

export * from "./common.js";

export const cryptoAlea = aleaFromByteSource((arr) =>
	globalThis.crypto.getRandomValues(arr)
);
