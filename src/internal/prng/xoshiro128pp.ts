import { Alea } from "../alea.js";
import { hashSeed } from "../util.js";

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
 * @returns Alea instance using Xoshiro128++
 */
export function xoshiro128pp(
	a: number | string,
	b: number | string,
	c: number | string,
	d: number | string
) {
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

	return new Alea(() => {
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
}
