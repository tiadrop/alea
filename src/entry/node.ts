import { aleaFromByteSource } from "../factories.js"
import { randomFillSync } from 'node:crypto';

export * from "./common.js";

export const cryptoAlea = aleaFromByteSource(randomFillSync);
