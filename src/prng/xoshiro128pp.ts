import { Alea } from "../internal/alea";
import { murmur3_32 } from "../internal/util";

function rotl(x: number, k: number): number {
	return (x << k) | (x >>> (32 - k));
}

/**
 * Create an Alea instance using a Xoshiro128++ source
 *
 * Very high statistical quality
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
		typeof v === "number" ? v >>> 0 : murmur3_32(String(v));

	let s0 = toWord(a) | 0;
	let s1 = toWord(b) | 0;
	let s2 = toWord(c) | 0;
	let s3 = toWord(d) | 0;

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
