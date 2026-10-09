import { useSyncExternalStore } from "react";

// One random seed per page load, read only in the browser. The server snapshot is
// null, so the static HTML and the first client render match, then the seeded
// values appear without a hydration mismatch.
const clientSeed = Math.floor(Math.random() * 2 ** 31);
const subscribe = () => () => {};
const getSeed = () => clientSeed;
const getServerSeed = () => null;

export function useClientSeed(): number | null {
  return useSyncExternalStore(subscribe, getSeed, getServerSeed);
}

// Small deterministic PRNG so one seed yields one consistent set of choices.
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
