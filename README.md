# Alea

### Tame the Chaos

Alea is a utility wrapper for turning random numbers into useful values. Give it any source of randomness, get a the same expressive API.

* Expressive: code with intent
* Crypto-safe and seeded algorithms out-of-the-box
* Array shuffling, weighted sampling, recursive template phrase generation, UUID, bytes and more
* Fully typed
* No dependencies
* ~1.2kb gzipped core

## Basics

Install: `npm i @xtia/alea`

```ts
import { alea } from "@xtia/alea";

// default alea draws from Math.random()

// game development
const damage = alea.between(10, 20);
const crit = alea.chance(0.1);
const loot = alea.sample(['sword', 'potion', 'gold']);

// data generation
const userId = alea.string(8, 'abcdef0123456789');
const fakeName = alea.phrase(nameTables, '{firstName} {lastName}');

// statistics
const [z1, z2] = alea.normal(0, 1);
```

For convenience, common character sets for string can be imported: `import { charsets } from "@xtia/alea"`.

## Crypto-secure

Use the same API layer, whatever the source of randomness:

```ts
import { cryptoAlea } from "@xtia/alea";

// cryptoAlea draws from runtime's crypto

const damage = cryptoAlea.between(10, 20);
const id = cryptoAlea.uuid();
const unpredictableDeck = cryptoAlea.shuffle(cards);
```

## Custom sources

Use any randomness provider:

```ts
import {
    aleaFromFunc,
    aleaFromSeed,
    aleaFromByteSource,
    aleaFromSequence
} from "@xtia/alea";

// deterministic, with seed (uses Mulberry32 PRNG):
const seededRng = aleaFromSeed("abc123");

// custom source of randomness:
const xkcdRng = aleaFromFunc(() => 4/6); // https://xkcd.com/221/

// from third-party PRNGs
import { MersenneTwister } from "acme-math";
const mt = new MersenneTwister(mySeed);
const mtAlea = aleaFromFunc(() => mt.random());

// from random byte providers:
const secureRng = aleaFromByteSource(
    buf => hardwareRng.fillRandomBytes(buf)
);

// preset sequence for debugging/testing
const presetRng = aleaFromSequence([.1, .4, .8], "loop");
```

Or use a provided PRNG algorithm:

```ts
import {
    mulberry32,
    sfc32,
    xoshiro128pp,
} from "@xtia/alea/prng";

// each returns an Alea instance:
const fast = mulberry32("my-seed");
const varied = sfc32(1, 2, 3, 4);
const strong = xoshiro128pp(5, 6, 7, 8);

const reproducibleId = varied.string(12, hexadecimal);
```

## Weighted and uniform samplers

`WeightedSampler` and `UniformSampler` facilitate advanced array/Map/Set sampling, providing methods to select a random item, or multiple unique items, from a list.

```ts
import { WeightedSampler } from "@xtia/alea";

// from a [value, weight][] table
const enemySpawner = new WeightedSampler(alea, [
    ["goblin", 10],
    ["orc", 5],
    ["dragon", 0.1] // rare but possible!
]);

const enemy = enemySpawner.sample();

// using a weight function
const dropSampler = new WeightedSampler(
    alea,
    enemy.items,
    item => item.value
);

// valuable items are more likely
const droppedItem = dropSampler.sample();
```

`sampler.sample(n)` returns `n` *unique* items, while `sampler.extract(n?)` selects *and removes* random items from the pool.

## Advanced: Probability Density Transforms

Transform randomness for different probability curves:

```ts
// exponential distribution
const expSampler = alea.transform(x => -Math.log(1 - x));
const waitTime = expSampler.between(0, 10);

// quadratic ease
const leftSkewed = alea.transform(x => x * x)
    .sample(items);

// square root ease
const rightSkewed = alea.transform(x => Math.sqrt(x))
    .sample(items);
```

## Technicalities

* String seeds are hashed with [DJB2-based accumulation with MurmurHash3](https://github.com/tiadrop/alea/blob/master/src/hash.ts) bit diffusion.
* `bytes()` queries the RNG provider once per 4 bytes; transform curves are applied at the 32-bit level.
