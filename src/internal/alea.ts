type RandomFunction = () => number;

type PhraseFunc = (parse: (template: string) => string) => string;

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
			throw new RangeError(
				`Cannot sample ${count} items from array of length ${items.length}`
			);
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
	shuffle<T>(items: ArrayLike<T>): T[] {
		const shuffled = Array.from(items);
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(this.next() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
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
	 *   addressee: ["world", "planet", "{adjective} @xtia user"],
	 *   adjective: ["beautiful", "wonderful"],
	 *   int: () => alea.int(0, 9).toString(),
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
		return root.replace(/\{([^}]+)\}/g, (_, key) => {
			if (table[key] === undefined) return `{${key}}`;
			if (typeof table[key] == "function") {
				return table[key]((template) => this.phrase(table, template));
			}
			const source = table[key];
			if (typeof source == "string") return this.phrase(table, source);
			return this.phrase(table, this.sample(source));
		});
	}

	/**
	 * Create a factory to pick random items from a biased list
	 * @param table Candidate table, as an array of `[value, weight]` tuples
	 * @returns Random item factory
	 */
	createWeightedSampler<T>(table: [value: T, weight: number][]) {
		const filtered = table.filter((v) => Number.isFinite(v[1]) && v[1] > 0);
		if (filtered.length === 0) {
			throw new Error("Weighted source has no viable candidates");
		}

		const cumulative: number[] = new Array(filtered.length);
		let total = 0;
		for (let i = 0; i < filtered.length; i++) {
			total += filtered[i][1];
			cumulative[i] = total;
		}

		return {
			sample: (): T => {
				const r = this.between(0, total);
				let lo = 0;
				let hi = cumulative.length - 1;
				while (lo < hi) {
					const mid = (lo + hi) >>> 1;
					if (r < cumulative[mid]) hi = mid;
					else lo = mid + 1;
				}
				return filtered[lo][0];
			},
		};
	}

	/**
	 * Generate a sequence of bytes
	 * @param size Number of bytes to generate
	 * @returns Random byte array
	 */
	bytes(size: number): Uint8Array;
	/**
	 * Fill a byte buffer with random bytes
	 * @param buffer Any TypedArray or DataView
	 * @returns The same buffer, filled
	 */
	bytes<T extends ArrayBufferView>(buffer: T): T;
	bytes(sizeOrBuffer: number | ArrayBufferView): ArrayBufferView {
		let byteArray: Uint8Array;
		let result: ArrayBufferView;

		if (typeof sizeOrBuffer === "number") {
			byteArray = new Uint8Array(sizeOrBuffer);
			result = byteArray;
		} else {
			byteArray = new Uint8Array(
				sizeOrBuffer.buffer,
				sizeOrBuffer.byteOffset,
				sizeOrBuffer.byteLength
			);
			result = sizeOrBuffer;
		}

		const len = byteArray.length;
		const words = Math.floor(len / 4);

		const view = new DataView(
			byteArray.buffer,
			byteArray.byteOffset,
			byteArray.byteLength
		);
		for (let i = 0; i < words; i++) {
			view.setUint32(i * 4, this.between(0, 0x100000000) >>> 0);
		}

		for (let i = words * 4; i < len; i++) {
			byteArray[i] = this.between(0, 256) | 0;
		}

		return result;
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
	 *
	 * **Security note**: output is only as cryptographically secure as
	 * an instance's PRNG source, which, by default, is not.
	 * @see {@link Alea.crypto}
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
}
