import { Alea } from "./internal/alea.js";
export type { Alea };
export {
	createAleaFromByteSource,
	createAleaFromSeed,
	createAleaFromFunc,
} from "./internal/factories.js";

export { charsets } from "./internal/charsets.js";

/**
 * An Alea instance that uses Math.random() as a source
 */
export const alea = new Alea(Math.random);

