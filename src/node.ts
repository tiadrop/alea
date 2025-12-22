import { createAleaFromByteSource } from "./internal/factories"
import { randomBytes } from 'node:crypto';

export * from "./common";

export const cryptoAlea = createAleaFromByteSource(arr => {
	randomBytes(arr.length).copy(arr);
});
