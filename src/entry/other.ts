import { Alea } from "../internal/alea.js";

export * from "./common.js";

/**
 * An Alea instance that uses the runtime environment's `crypto` provider as a source
 */
export const cryptoAlea = new Alea(() => {
	throw new Error("cryptoAlea is not available in this environment. Consider using createAleaFromByteSource() with your environment's crypto API.");
});
