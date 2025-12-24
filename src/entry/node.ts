import { aleaFromByteSource } from "../internal/factories.js"
import { randomBytes } from 'node:crypto';

export * from "./common.js";

export const cryptoAlea = aleaFromByteSource(arr => {
	randomBytes(arr.length).copy(arr);
});
