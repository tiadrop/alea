import { Alea } from "@xtia/alea";

export interface Sampler<T> {
	/**
	 * Randomly select a single item
	 * 
	 * Pass a `count` to select multiple **unique** items, returned as an array
	 */
	sample(): T;
	sample(count: number): T[];
	/**
	 * Randomly select a single item and remove it from the selection pool
	 * 
	 * Pass a `count` to extract multiple **unique** items, returned as an array
	 */
	extract(): T;
	extract(count: number): T[];
	/**
	 * Number of remaining viable items
	 */
	get size(): number;
}

export class WeightedSampler<T> implements Sampler<T> {
	private readonly table: [T, number][];
	private readonly weightMap: number[];
	private totalWeight: number;

	private getRandomIndex() {
		const pos = this.alea.next() * this.totalWeight;
		let lower = 0;
		let upper = this.weightMap.length - 1;
		while (lower < upper) {
			const mid = (lower + upper) >>> 1;
			if (pos < this.weightMap[mid]) upper = mid;
			else lower = mid + 1;
		}
		return lower;
	}
	
	/**
	 * Create a weighted sampler from a weight table
	 * @param alea An Alea instance from which to draw randomness
	 * @param table A table array or Map of `[value, weight]`
	 */
	constructor(alea: Alea, table: [value: T, weight: number][] | Map<T, number>)
	/**
	 * Create a weighted sampler from a list and a weight function
	 * @param alea An Alea instance from which to draw randomness
	 * @param items List of selection candidates
	 * @param weightFn A function to determine an item's weight (likelihood) of being selected
	 */
	constructor(alea: Alea, items: ArrayLike<T> | Set<T>, weightFn: (value: T) => number)
	constructor(
		private readonly alea: Alea,
		tableOrItems: Map<T, number> | [value: T, weight: number][] | ArrayLike<T> | Set<T>, weightFn?: (item: T) => number
	) {
		let unfiltered: [T, number][];
		if (weightFn) {
			const items = Array.isArray(tableOrItems)
				? tableOrItems as T[]
				: Array.from(tableOrItems as Set<T>);
			unfiltered = items.map(item => [item, weightFn(item)]);
		} else if (tableOrItems instanceof Map) {
			unfiltered = [...tableOrItems.entries()];
		} else {
			unfiltered = tableOrItems as [T, number][];
		}

		const filtered = unfiltered.filter(([, weight]) => weight > 0);

		if (filtered.some(([, weight]) => !Number.isFinite(weight))) {
			throw new RangeError("Infinity-weighted items are not allowed");
		}
		
		this.table = filtered;
		let total = 0;
		this.weightMap = filtered.map(v => total += v[1]);
		this.totalWeight = total;
	}

	sample(): T;
	sample(count: number): T[];
	sample(count?: number): T | T[] {
		if (count === undefined) {
			if (this.table.length == 0) {
				throw new Error("Empty sample source");
			}
			const index = this.getRandomIndex();
			return this.table[index][0];
		}

		const temp = new WeightedSampler(this.alea, this.table);
		return temp.extract(count);
	}


	extract(): T;
	extract(count: number): T[];
	extract(count?: number): T | T[] {
		if (count === undefined) {
			if (this.table.length == 0) {
				throw new Error("Empty sample source");
			}
			const index = this.getRandomIndex();
			
			const [result, weight] = this.table[index];
			this.totalWeight -= weight;
			// update weight map
			for (let i = index; i < this.weightMap.length; i++) {
				this.weightMap[i] -= weight;
			}
			this.table.splice(index, 1);
			return result;
		}
		
		if (count <= 0 || !Number.isInteger(count)) {
			throw new Error(`Count must be a positive integer, got ${count}`);
		}
		if (count > this.table.length) {
			throw new Error(`Cannot extract ${count} unique items from only ${this.table.length} candidates`);
		}

		if (count === this.table.length) {
			const values = this.table.map(i => i[0]);
			this.table.splice(0, this.table.length);
			this.totalWeight = 0;
			return this.alea.shuffle(values);
		}

		return Array.from({length: count}, () => this.extract());
	}
	
	/**
	 * Number of remaining viable (positively-weighted) items
	 */
	get size() {
		return this.table.length;
	}
}

export class UniformSampler<T> implements Sampler<T> {
	private items: T[];

	constructor(
		private alea: Alea,
		items: T[] | Set<T> 
	) {
		this.items = Array.from(items);
	}

	sample(): T;
	sample(count: number): T[];
	sample(count?: number): T | T[] {
		if (count === undefined) return this.alea.sample(this.items);
		return this.alea.sample(this.items, count);
	}

	extract(): T;
	extract(count: number): T[];
	extract(count?: number): T | T[] {
		if (count === undefined) {
			if (this.items.length == 0) {
				throw new Error("Empty sample source");
			}
			const idx = this.alea.int(this.items.length - 1);
			return this.items.splice(idx, 1)[0];
		};
		if (count <= 0 || !Number.isInteger(count)) {
			throw new Error(`Count must be a positive integer, got ${count}`);
		}
		if (count > this.items.length) {
			throw new Error(`Cannot extract ${count} unique items from only ${this.items.length} candidates`);
		}

		if (count === this.items.length) {
			const values = this.alea.shuffle(this.items);
			this.items.splice(0, this.items.length);
			return values;
		}

		for (let i = 0; i < count; i++) {
			const idx = this.alea.int(i, this.items.length - 1);
			[this.items[i], this.items[idx]] = [this.items[idx], this.items[i]];
		}
		
		return this.items.splice(0, count);
	}

	get size() {
		return this.items.length;
	}
}