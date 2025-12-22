import { Alea } from "../internal/alea.js";
import { murmur3_32 } from "../internal/util.js";

/**
 * Create an Alea instance using a Small Fast Counter (SFC32) source
 * 
 * Fairly fast, with high statistical quality
 * @param a Seed A
 * @param b Seed B
 * @param c Seed C
 * @param d Seed D
 * @returns Alea isntance using SFC32
 */
export function sfc32(a: number | string, b: number | string, c: number | string, d: number | string) {
    const toWord = (v: number | string) =>
        typeof v === "number" ? (v >>> 0) : murmur3_32(String(v));

    let s0 = toWord(a) | 0;
    let s1 = toWord(b) | 0;
    let s2 = toWord(c) | 0;
    let s3 = toWord(d) | 0;

    return new Alea(() => {
        s0 |= 0; s1 |= 0; s2 |= 0; s3 |= 0;
        const t = (s0 + s1 | 0) + s3 | 0;
        s3 = s3 + 1 | 0;
        s0 = s1 ^ s1 >>> 9;
        s1 = s2 + (s2 << 3) | 0;
        s2 = (s2 << 21 | s2 >>> 11) + t | 0;
        return (t >>> 0) / 4294967296;
    });
}