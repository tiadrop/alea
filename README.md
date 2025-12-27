# Alea

### Tame the Chaos

Alea is a utility wrapper for turning random numbers into useful values. Give it any source of randomness, get a toolkit for dice, samples, strings, and more.

* Expressive: code with intent
* Crypto-safe and seeded algorithms out-of-the-box
* Array shuffling, weighted sampling, recursive template phrase generation, UUID, bytes and more
* Fully typed
* No dependencies
* ~2.4kb minified core

## Basics

Install: `npm i @xtia/alea`

```ts
import { alea } from "@xtia/alea";

// default alea draws from Math.random()

// game development
const damage = alea.between(10, 20);
const crit = alea.chance(0.1);
const loot = alea.sample(['sword', 'potion', 'gold']);
const enemySpawner = alea.createWeightedSampler([
    ["goblin", 10],
    ["orc", 5],
    ["dragon", 0.1] // rare but possible!
]);
const enemy = enemySpawner.sample();

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

// from random byte providers:
const secureRng = aleaFromByteSource(
    buf => hardwareRng.fillRandomBytes(buf)
);

// preset sequence for debugging
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
