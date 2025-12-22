import { createAleaFromByteSource } from "./internal/factories"

export * from "./common";

export const cryptoAlea = createAleaFromByteSource(arr => globalThis.crypto.getRandomValues(arr));
