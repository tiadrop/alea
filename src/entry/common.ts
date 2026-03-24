import { Alea } from "../alea.js";
export type { Alea };
export {
	aleaFromByteSource,
	aleaFromSeed,
	aleaFromFunc,
	aleaFromSequence,
} from "../factories.js";

export { charsets } from "../charsets.js";

/**
 * An Alea instance that uses Math.random() as a source
 */
export const alea = new Alea(Math.random);