import { Alea } from "../internal/alea.js";
export type { Alea };
export {
	aleaFromByteSource,
	aleaFromSeed,
	aleaFromFunc,
} from "../internal/factories.js";

export { charsets } from "../internal/charsets.js";

/**
 * An Alea instance that uses Math.random() as a source
 */
export const alea = new Alea(Math.random);