import { createAleaFromByteSource } from "../internal/factories.js";

export * from "./common.js";

export const cryptoAlea = createAleaFromByteSource((arr) =>
	globalThis.crypto.getRandomValues(arr)
);
