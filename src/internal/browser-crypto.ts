import { Alea } from "./alea";
import { createAleaFromByteSource } from "./factories";

export const cryptoAlea =
	"crypto" in globalThis && "getRandomValues" in globalThis.crypto
		? createAleaFromByteSource(globalThis.crypto.getRandomValues)
		: new Alea(() => {
				throw new Error(
					"cryptoAlea is not available in this environment. Consider createAleaFromByteSource(cryptoModule.fillBytes) or your environment's equivalent"
				);
		  });