import { Alea } from "../alea.js";
import { hashSeed } from "../hash.js";

/**
 * Create an Alea instance that draws from a Mulberry32 PRNG
 * 
 * - Fast, with decent statistical quality
 * @param seed 
 * @param exposeState If true, returns an object of `{ alea: Alea, saveState(): number }`
 * @returns Alea instance using Mulberry32
 */
export function mulberry32(seed: number | string, exposeState?: false): Alea
/**
 * Create an Alea instance that draws from a Mulberry32 PRNG
 * 
 * - Fast, with decent statistical quality
 * @param seed Initial seed value
 * @param exposeState If true, returns an object of `{ alea: Alea, saveState(): number }`
 * @returns Object with an Alea instance using Mulberry32, and a state export function
 */
export function mulberry32(seed: number | string, exposeState: true): {alea: Alea, saveState(): number}
export function mulberry32(seed: number | string, exposeState: boolean = false) {
	let nseed = hashSeed(seed);

	const alea = new Alea(() => {
		nseed |= 0;
		nseed = nseed + 0x6D2B79F5 | 0;
		let t = Math.imul(nseed ^ nseed >>> 15, 1 | nseed);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	});

	if (exposeState) return {
		alea,
		saveState() {
			return nseed;
		}
	}
	return alea;
};