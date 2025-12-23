import { Alea } from "../internal/alea.js";
import { hashSeed } from "../internal/util.js";

/**
 * Create an Alea instance using a Mulberry32 source
 * 
 * Fast, with decent statistical quality
 * @param seed 
 * @returns Alea instance using Mulberry32
 */
export const mulberry32 = (seed: number | string) => {
	let nseed = typeof seed == "string" ? hashSeed(seed) : (seed >>> 0);
	return new Alea(() => {
		nseed |= 0;
		nseed = nseed + 0x6D2B79F5 | 0;
		let t = Math.imul(nseed ^ nseed >>> 15, 1 | nseed);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	});
};