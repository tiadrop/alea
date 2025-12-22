import { Alea } from "./internal/alea";
export type { Alea };
export {
	createAleaFromByteSource,
	createAleaFromSeed,
	createAleaFromFunc,
} from "./internal/factories";

export { charsets } from "./internal/util";

export const alea = new Alea(Math.random);

