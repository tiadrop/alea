import { mulberry32 } from "./prng/mulberry32.js";
import { Alea } from "./alea.js";

/**
 * Create an Alea instance that draws from a byte generator, such as `crypto`
 * @example
 * ```ts
 * const cryptoAlea = aleaFromByteSource(buf => crypto.getRandomValues(buf));
 * const hwAlea = aleaFromByteSource(buf => hardwareRng.fillBytes(buf));
 * ```
 * @param applyBytes A callback that fills a Uint8Array(4) with random bytes
 * @returns A byte generator-sourced Alea instance
 */
export function aleaFromByteSource(
    applyBytes: (buffer: Uint8Array<ArrayBuffer>) => void
) {
	const u8a = new Uint8Array(4);
	const view = new DataView(u8a.buffer);
    return new Alea(() => {
        applyBytes(u8a);
        const result = view.getUint32(0) / 4294967296;
        view.setUint32(0, 0);
        return result;
    });
}

/**
 * Create an Alea instance that draws from a seeded Mulberry32 PRNG
 * 
 * - Fast, with decent statistical quality
 * 
 * For applications requiring higher statistical quality or different characteristics, see the specialised PRNGs in @xtia/alea/prng
 * @param seed 
 * @returns Alea instance using Mulberry32
 */
export function aleaFromSeed(seed: number | string) {
	return mulberry32(seed);
}

/**
 * Create an Alea instance that draws from a custom function
 * @example
 * ```ts
 * const alea = aleaFromFunc(Math.random);
 * const customAlea = aleaFromFunc(customRng.next);
 * ```
 * @param fn Source RNG; a function that returns a value >= 0 and < 1
 * @returns Custom function-sourced Alea instance
 */
export function aleaFromFunc(fn: () => number) {
	return new Alea(fn);
}

type ExhaustionHandler = 'throw' | 'loop' | number | ((index: number) => number) | {
	next: () => number;
};

/**
 * Create an Alea instance that draws sequentially from a list of values
 * @param sequence List of values >= 0 and < 1
 * @param onExhaust Defines behaviour when the sequence is exhausted
 * @returns Sequence-sourced Alea instance
 */
export function aleaFromSequence(sequence: ArrayLike<number>, onExhaust: ExhaustionHandler = "throw"): Alea {
    let index = 0;
    const len = sequence.length;

	return new Alea(() => {
        if (index >= len) {
			if (
				typeof onExhaust === "object"
			) {
				return onExhaust.next();
			}
            switch (onExhaust) {
                case 'throw':
                    throw new RangeError(`Sequence exhausted at index ${index}`);
                case 'loop':
                    index = 0;
                    break;
                default: {
					return typeof onExhaust == "number"
						? onExhaust
						: onExhaust(index);
				}
            }
        }
        return sequence[index++];
    });
}
