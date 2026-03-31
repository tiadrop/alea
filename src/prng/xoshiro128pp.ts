import { Alea } from "../alea.js";
import { hashSeed } from "../hash.js";

function rotl(x: number, k: number): number {
	return (x << k) | (x >>> (32 - k));
}

/**
 * Create an Alea instance that draws from a Xoshiro128++ PRNG
 *
 * - Very high statistical quality
 * @param a Seed A
 * @param b Seed B
 * @param c Seed C
 * @param d Seed D
 * @param exposeState If true, returns an object of `{ alea: Alea, saveState(): [number, number, number, number] }`
 * @returns Alea instance using Xoshiro128++
 */
export function xoshiro128pp(
	a: number | string,
	b: number | string,
	c: number | string,
	d: number | string,
	exposeState?: false,
): Alea
export function xoshiro128pp(
	a: number | string,
	b: number | string,
	c: number | string,
	d: number | string,
	exposeState: true,
): {
    alea: Alea;
    saveState(): readonly [number, number, number, number];
}
export function xoshiro128pp(
	a: number | string,
	b: number | string,
	c: number | string,
	d: number | string,
	exposeState: boolean = false,
)
 {
	const toWord = (v: number | string) =>
		(typeof v === "number" ? v >>> 0 : hashSeed(String(v))) | 0;

	let s0 = toWord(a);
	let s1 = toWord(b);
	let s2 = toWord(c);
	let s3 = toWord(d);

	// requires at least one non-zero value
	if (s0 === 0 && s1 === 0 && s2 === 0 && s3 === 0) {
		s0 = 1;
	}

	const alea = new Alea(() => {
		s0 |= 0;
		s1 |= 0;
		s2 |= 0;
		s3 |= 0;

		const result = (rotl(s0 + s3, 7) + s0) >>> 0;

		const t = s1 << 9;

		s2 ^= s0;
		s3 ^= s1;
		s1 ^= s2;
		s0 ^= s3;

		s2 ^= t;
		s3 = rotl(s3, 11);

		return result / 4294967296;
	});

	if (exposeState) {
		return {
			alea,
			saveState() {
            	return [s0, s1, s2, s3] as const;
        	}
		}
	}

	return alea;
}
