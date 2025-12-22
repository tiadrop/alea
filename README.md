# Alea

### Tame the Chaos

Alea is a utility wrapper for turning random numbers into useful values. Give it any source of randomness, get a toolkit for dice, samples, strings, and more.

* Fully typed
* Crypto-safe and seeded algorithms out-of-the-box
* No dependencies
* ~2.3kb minified
* Ranged int, array shuffling, dice roll, weighted sampling, phrase generation, uuid, bytes and many more

## Brief:

`npm i @xtia/alea` (pending release; use `@xtia/alea-rc` to preview)

```ts
import { alea, cryptoAlea } from "@xtia/alea";

// generate values (driven by Math.random())
const damage = alea.roll(2, 6); // 2d6
const duration = alea.between(1000, 1500);
const loot = alea.chance(0.125) ? "epic" : "common";
const id = alea.string(5);
const npcName = alea.sample(["Alice", "Bob", "Charlie"]);

// secure source (driven by environment's crypto)
const key = cryptoAlea.string(16);
```

## Custom sources

Use any provider as RNG source:

```ts
import {
    createAleaFromFunc,
    createAleaFromSeed,
    createAleaFromByteSource,
} from "@xtia/alea";

const deterministic = createAleaFromSeed("abc123");
const xkcdRng = createAleaFromFunc(() => 4/6); // https://xkcd.com/221/
const secure = createAleaFromByteSource(
    buf => hardwareRNG.fillRandomBytes(buf)
);

// or use provided PRNG algorithms:
import {
    mulberry32,
    sfc32,
    xoshiro128pp,
} from "@xtia/alea/prng";

// each returns an Alea instance:
const fast = mulberry32("my-seed");
const varied = sfc32(1, 2, 3, 4);
const strong = xoshiro128pp(5, 6, 7, 8);

const reproducibleId = varied.string(5);
```
