import { Alea } from "./internal/alea";

export * from "./common";

/**
 * An Alea instance that uses the local environment's `crypto` provider
 */
export const cryptoAlea = new Alea(() => {
	throw new Error("cryptoAlea is not available in this environment. Consider using createAleaFromByteSource() with your environment's crypto API.");
});
