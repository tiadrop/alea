export function hashSeed(seed: string): number {
    let hash = 0;
    
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = Math.imul(hash, 33) ^ char;
        hash = hash | 0;
    }
    
    hash ^= hash >>> 16;
    hash = Math.imul(hash, 0x85ebca6b);
    hash ^= hash >>> 13;
    hash = Math.imul(hash, 0xc2b2ae35);
    hash ^= hash >>> 16;
    
    return hash >>> 0;
}