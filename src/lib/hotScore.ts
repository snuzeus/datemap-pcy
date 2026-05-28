type HotScoreInput = {
  searchVolume: number;    // 네이버 데이터랩 검색량 (0~100 normalized)
  populationDensity: number; // 서울 도시데이터 혼잡도 (0~100 normalized)
};

const SEARCH_WEIGHT = 0.6;
const POPULATION_WEIGHT = 0.4;

export function calcHotScore({ searchVolume, populationDensity }: HotScoreInput): number {
  const score = searchVolume * SEARCH_WEIGHT + populationDensity * POPULATION_WEIGHT;
  return Math.round(score * 10) / 10;
}
