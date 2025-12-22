import { mulberry32 } from "../prng";
import { Alea } from "./alea";

/**
 * Create an Alea instance using a byte generator, such as `crypto`,
 * as a RNG source
 * @example
 * ```ts
 * const cryptoAlea = createAleaFromByteSource(crypto.getRandomValues);
 * const hwAlea = createAleaFromByteSource(hardwareRng.fillBytes);
 * ```
 * @param applyBytes A callback that fills a Uint8Array with random bytes
 * @returns A byte generator-sourced Alea instance
 */
export function createAleaFromByteSource(
	applyBytes: (buffer: Uint8Array) => void
) {
	const buffer = new ArrayBuffer(4);
	const view = new Uint8Array(buffer);
	const uint32View = new Uint32Array(buffer);
	
	return new Alea(() => {
		applyBytes(view);
		return uint32View[0] / 4294967296;
	});
}

/**
 * Create an Alea instance using a Mulberry32 source
 * 
 * Fast, with decent statistical quality
 * 
 * For applications requiring higher statistical quality or different characteristics, see the specialized PRNGs in @xtia/Alea/prng
 * @param seed 
 * @returns Alea instance using Mulberry32
 */
export function createAleaFromSeed(seed: number | string) {
	return mulberry32(seed);
}

/**
 * Create an Alea instance using a custom function as an RNG source
 * @example
 * ```ts
 * const basicAlea = createAleaFromFunc(Math.random);
 * const lcgAlea = createAleaFromFunc(customRng.next);
 * ```
 * @param fn Source RNG; a function that returns a value >= 0 and < 1
 * @returns Custom function-sourced Alea instance
 */
export function createAleaFromFunc(fn: () => number) {
	return new Alea(fn);
}

// const xkcdAlea = createAleaFromFunc(() => 4/6); // decided by die roll
