import { createAleaFromByteSource } from "./internal/factories.js"
import { randomBytes } from 'node:crypto';

export * from "./common.js";

export const cryptoAlea = createAleaFromByteSource(arr => {
	randomBytes(arr.length).copy(arr);
});
