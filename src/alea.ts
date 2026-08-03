import { PhraseFunc, PhraseGen } from "./phrase.js";

type RandomFunction = () => number;

export class Alea {
	/**
	 * Generate a float between 0 and 1 (exclusive)
	 */
	readonly next: RandomFunction;

	/**
	 * @param next Source RNG - a function that returns a value >= 0 and < 1
	 */
	constructor(next: RandomFunction) {
		this.next = next;
	}

	/**
	 * Pick a random item from an array
	 * @param items
	 * @returns Random item from an array
	 */
	sample<T>(items: ArrayLike<T>): T;
	/**
	 * Pick a number of unique random items from an array
	 * @param items
	 * @param count
	 * @returns Random items from an array
	 */
	sample<T>(items: ArrayLike<T>, count: number): T[];
	sample<T>(items: ArrayLike<T>, count?: number): T | T[] {
		if (count === undefined) {
			if (items.length === 0) throw new RangeError("Empty sample source");
			return items[Math.floor(this.next() * items.length)];
		}

		if (!Number.isInteger(count) || count < 0) {
			throw new RangeError("count must be a non-negative integer");
		}

		if (count > items.length) {
			throw new RangeError(`Cannot sample ${count} unique items from only ${items.length} candidates`);
		}

		const result = Array.from({ length: count }, (_, index) => items[index]);

		for (let i = count; i < items.length; i++) {
			const replaceIndex = Math.floor(this.next() * (i + 1));
			if (replaceIndex < count) {
				result[replaceIndex] = items[i];
			}
		}

		return result;
	}

	/**
	 * Get a boolean value with a (`probability` in 1) chance of being `true`
	 * @param probability
	 * @returns Random boolean
	 */
	chance(probability: number) {
		return this.next() < probability;
	}

	/**
	 * Get a shuffled copy of an array
	 * @param items
	 * @returns Shuffled copy of an array
	 */
	shuffle<T>(items: ArrayLike<T>): T[]
	/**
	 * Shuffle an array, in-place or as copy
	 * @param items
	 * @param inPlace If true, the array passed in will be shuffled
	 * @returns The shuffled array
	 */
	shuffle<T>(items: T[], inPlace: boolean): T[]
	shuffle<T>(items: ArrayLike<T>, inPlace: boolean = false): T[] {
		const array = inPlace ? items as T[] : Array.from(items);
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(this.next() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	/**
	 * Get a value between `min` and `max`
	 * @param min Minimum value, *inclusive*
	 * @param max Maximum value, *exclusive*
	 * @returns Random value in range
	 */
	between(min: number, max: number) {
		const range = max - min;
		return min + range * this.next();
	}

	/**
	 * Get a random integer between 0 and max (**inclusive**)
	 * @param max 
	 */
	int(max: number): number
	/**
	 * Get a random integer between min and max (**inclusive**)
	 * @param max 
	 */
	int(min: number, max: number): number
	int(m: number, _max?: number): number {
		const min = _max === undefined ? 0 : m;
		const max = _max ?? m;
		return Math.floor(this.between(min, max + 1));
	}

	/**
	 * Generate a random string, drawing a given character set
	 * @param length
	 * @param charset
	 * @returns Generated string
	 */
	string(length: number, charset: string) {
		if (!Number.isInteger(length) || length < 0)
			throw new RangeError("length must be a non-negative integer");
		const pool = [...charset];
		if (pool.length === 0) throw new RangeError("charset must not be empty");

		return Array.from({ length }, () => this.sample(pool)).join("");
	}

	/**
	 * Generate a phrase from a table and a root string
	 * @example
	 * ```ts
	 * const message = alea.phrase({
	 *   greeting: ["hello", "hi", "{int} blessings"],
	 *   addressee: ["world", "planet", "{adjective} Alea user"],
	 *   adjective: ["beautiful", "wonderful"],
	 *   int: () => Math.floor(alea.between(3, 9)).toString(),
	 * }, "{greeting}, {addressee}!")
	 * ```
	 * @param table
	 * @param root
	 * @returns Generated phrase
	 */
	phrase(
		table: Record<string, ArrayLike<string> | string | PhraseFunc>,
		root: string
	): string {
		const gen = new PhraseGen(this, table);
		return gen.generate(root);
	}

	/**
	 * Generate a sequence of bytes
	 * 
	 * *Technical note*: queries RNG source once per 4 bytes;
	 * probability distribution applies at the 32-bit level
	 * 
	 * @param size Number of bytes to generate
	 * @returns Random byte array
	 */
	bytes(size: number): Uint8Array;
	/**
	 * Fill a byte buffer with random bytes
	 * 
	 * *Technical note*: queries RNG source once per 4 bytes;
	 * probability distribution applies at the 32-bit level
	 * 
	 * @param buffer Any TypedArray or DataView
	 * @returns The same buffer, filled
	 */
	bytes<T extends ArrayBufferView>(buffer: T): T;
	bytes(sizeOrBuffer: number | ArrayBufferView): ArrayBufferView {
		const byteArray = typeof sizeOrBuffer === "number"
			? new Uint8Array(sizeOrBuffer)
			: new Uint8Array(sizeOrBuffer.buffer, sizeOrBuffer.byteOffset, sizeOrBuffer.byteLength);
		
		const len = byteArray.length;
		const words = len >>> 2;
		const remainder = len & 3;
		
		const view = new DataView(byteArray.buffer, byteArray.byteOffset, byteArray.byteLength);
		for (let i = 0; i < words; i++) {
			view.setUint32(i * 4, this.between(0, 0x100000000) >>> 0);
		}
		
		if (remainder) {
			const word = this.between(0, 0x100000000) >>> 0;
			const offset = words * 4;
			switch (remainder) {
				case 3: byteArray[offset + 2] = (word >>> 8) & 0xFF;
				case 2: byteArray[offset + 1] = (word >>> 16) & 0xFF;
				case 1: byteArray[offset] = (word >>> 24) & 0xFF;
			}
		}
		
		return typeof sizeOrBuffer === "number" ? byteArray : sizeOrBuffer;
	}

	/**
	 * Round a value up or down, according to probability defined by its non-integral part
	 * @example
	 * ```ts
	 * const rawDamage = weapon.damage / armour.protection;
	 * hp -= alea.round(rawDamage);
	 * // HP remains integer while law of averages applies fractional damage
	 * ```
	 * @param n
	 * @returns Randomly rounded value
	 */
	round(n: number) {
		const floor = Math.floor(n);
		return this.chance(n - floor) ? floor + 1 : floor;
	}

	/**
	 * Get a random normal pair using Box-Muller transform
	 * @param mean
	 * @param deviation
	 * @returns Gaussian normal pair
	 */
	normal(mean = 0, deviation = 1): [number, number] {
		let u1 = this.next();
		while (u1 <= Number.EPSILON) u1 = this.next();
		const u2 = this.next();
		const mag = Math.sqrt(-2 * Math.log(u1));
		const angle = 2 * Math.PI * u2;
		
		const z0 = mag * Math.cos(angle);
		const z1 = mag * Math.sin(angle);
		
		return [
			mean + z0 * deviation,
			mean + z1 * deviation
		];
	}

	/**
	 * Generate a random UUID (version 4)
	 * @see {@link ./entry/other.ts#cryptoAlea}
	 * @returns Random UUID string
	 */
	uuid(): string {
		// xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
		const bytes = this.bytes(16);

		bytes[6] = (bytes[6] & 0x0f) | 0x40;
		bytes[8] = (bytes[8] & 0x3f) | 0x80;

		const hex = Array.from(bytes, (byte) =>
			byte.toString(16).padStart(2, "0")
		).join("");

		return [
			hex.slice(0, 8),
			hex.slice(8, 12),
			hex.slice(12, 16),
			hex.slice(16, 20),
			hex.slice(20, 32),
		].join("-");
	}

	/**
	 * Create an Alea instance using transformed values sourced from a
	 * parent instance
	 * 
	 * **Caution**: transforming to values outside of the expected range (>=0, < 1) can
	 * cause erratic behaviour, and, due to the nature of randomness, adherence cannot
	 * be verified automatically.
	 * @param fn A function that takes and returns values >= 0 and < 1
	 * @returns Alea instance following the transformed distribution
	 */
	transform(fn: (n: number) => number) {
		return new Alea(() => fn(this.next()));
	}
}
