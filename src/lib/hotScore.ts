type HotScoreInput = {
  searchVolume: number; // region catalog baseline interest score (0-100 normalized)
  populationDensity: number; // Seoul realtime congestion score (0-100 normalized)
};

const SEARCH_WEIGHT = 0.6;
const POPULATION_WEIGHT = 0.4;

export function calcHotScore({ searchVolume, populationDensity }: HotScoreInput): number {
  const score = searchVolume * SEARCH_WEIGHT + populationDensity * POPULATION_WEIGHT;
  return Math.round(score * 10) / 10;
}
