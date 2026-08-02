import { Alea } from "./alea";

export type PhraseFunc = (parse: (template: string) => string) => string;

// a simple phrase gen, for backward-compat, pending a more substantial design

export class PhraseGen {
	constructor(
		private alea: Alea,
		private table: Record<string, ArrayLike<string> | string | PhraseFunc>
	) {}

	private memo = new Map<string, string>();

	generate(term: string): string {
		return term.replace(/\{([^}]+)\}/g, (_, key: string) => {
			if (this.table[key] === undefined) {
				if (key.includes("=")) {
					// "{g=greeting}" persists as 'g' - "Alice bought {numBananas=int} bananas. She ate all {numBananas=int} bananas."
					// "{=greeting}" persists as 'greeting' - "'My name is {=name}', said {=name}."
					// persistence is per PhraseGen, not per generate() call
					const [memoKey, subkey] = key.split("=", 2);
					if (!this.memo.has(memoKey || subkey)) {
						if (!(subkey in this.table)) return `{${key}}`;
						this.memo.set(memoKey || subkey, this.generate(`{${subkey}}`));
					}
					return this.memo.get(memoKey || subkey)!;
				}
				return `{${key}}`
			}
			if (typeof this.table[key] == "function") {
				return this.table[key](v => this.generate(v));
			}
			const source = this.table[key];
			if (typeof source == "string") return this.generate(source);
			return this.generate(this.alea.sample(source));
		});
	}

}