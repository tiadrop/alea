import { mulberry32 } from "./prng/mulberry32.js";
import { Alea } from "./alea.js";

/**
 * Create an Alea instance that draws from a byte generator, such as `crypto`
 * @example
 * ```ts
 * const cryptoAlea = aleaFromByteSource(crypto.getRandomValues);
 * const hwAlea = aleaFromByteSource(hardwareRng.fillBytes);
 * ```
 * @param applyBytes A callback that fills a Uint8Array with random bytes
 * @returns A byte generator-sourced Alea instance
 */
export function aleaFromByteSource(
	applyBytes: (buffer: Uint8Array) => void
) {
	return new Alea(() => {
        const buffer = new ArrayBuffer(4);
		const view = new DataView(buffer);
		applyBytes(new Uint8Array(buffer));
		return view.getUint32(0) / 4294967296;
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
 * const basicAlea = aleaFromFunc(Math.random);
 * const lcgAlea = aleaFromFunc(customRng.next);
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
 * Create an Alea instance that draws sequentially from a fixed list of values
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
