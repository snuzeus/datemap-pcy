export type RegionCatalogItem = {
  id: string;
  name: string;
  district: string;
  keyword: string;
  imageQuery: string;
  coords: { x: string; y: string };
  gradient: string;
  defaultSearchVolume: number;
  defaultPopulationDensity: number;
  seoulAreaName?: string;
};

export const REGION_CATALOG: RegionCatalogItem[] = [
  {
    id: 'seongsu',
    name: '성수동',
    district: '서울 성동구',
    keyword: '성수동',
    imageQuery: '성수동 카페거리 서울',
    coords: { x: '127.0557', y: '37.5445' },
    gradient: 'g-seongsu',
    defaultSearchVolume: 90,
    defaultPopulationDensity: 70,
    seoulAreaName: '성수카페거리',
  },
  {
    id: 'hongdae',
    name: '홍대·합정',
    district: '서울 마포구',
    keyword: '홍대',
    imageQuery: '홍대 합정 거리 서울',
    coords: { x: '126.9236', y: '37.5561' },
    gradient: 'g-hongdae',
    defaultSearchVolume: 85,
    defaultPopulationDensity: 50,
    seoulAreaName: '홍대 관광특구',
  },
  {
    id: 'gangnam',
    name: '강남·청담',
    district: '서울 강남구',
    keyword: '강남',
    imageQuery: '강남 청담 서울',
    coords: { x: '127.0276', y: '37.4979' },
    gradient: 'g-gangnam',
    defaultSearchVolume: 80,
    defaultPopulationDensity: 90,
    seoulAreaName: '강남역',
  },
  {
    id: 'itaewon',
    name: '이태원·한남',
    district: '서울 용산구',
    keyword: '이태원',
    imageQuery: '이태원 한남동 서울',
    coords: { x: '126.9946', y: '37.5348' },
    gradient: 'g-itaewon',
    defaultSearchVolume: 72,
    defaultPopulationDensity: 50,
    seoulAreaName: '이태원 관광특구',
  },
  {
    id: 'yeonnam',
    name: '연남·망원',
    district: '서울 마포구',
    keyword: '연남동',
    imageQuery: '연남동 망원동 서울',
    coords: { x: '126.9207', y: '37.5612' },
    gradient: 'g-yeonnam',
    defaultSearchVolume: 70,
    defaultPopulationDensity: 20,
    seoulAreaName: '연남동',
  },
  {
    id: 'jamsil',
    name: '잠실·송리단길',
    district: '서울 송파구',
    keyword: '잠실 송리단길',
    imageQuery: '잠실 송리단길 서울',
    coords: { x: '127.1001', y: '37.5133' },
    gradient: 'g-jamsil',
    defaultSearchVolume: 76,
    defaultPopulationDensity: 70,
    seoulAreaName: '잠실 관광특구',
  },
  {
    id: 'myeongdong',
    name: '명동·을지로',
    district: '서울 중구',
    keyword: '명동 을지로',
    imageQuery: '명동 을지로 서울',
    coords: { x: '126.9850', y: '37.5636' },
    gradient: 'g-myeongdong',
    defaultSearchVolume: 74,
    defaultPopulationDensity: 70,
    seoulAreaName: '명동 관광특구',
  },
  {
    id: 'bukchon',
    name: '북촌·삼청',
    district: '서울 종로구',
    keyword: '북촌 삼청동',
    imageQuery: '북촌 삼청동 서울',
    coords: { x: '126.9849', y: '37.5826' },
    gradient: 'g-bukchon',
    defaultSearchVolume: 68,
    defaultPopulationDensity: 50,
    seoulAreaName: '북촌한옥마을',
  },
  {
    id: 'sinsa',
    name: '신사·가로수길',
    district: '서울 강남구',
    keyword: '신사 가로수길',
    imageQuery: '신사동 가로수길 서울',
    coords: { x: '127.0234', y: '37.5207' },
    gradient: 'g-sinsa',
    defaultSearchVolume: 66,
    defaultPopulationDensity: 50,
  },
  {
    id: 'mullae',
    name: '문래동',
    district: '서울 영등포구',
    keyword: '문래동',
    imageQuery: '문래동 창작촌 서울',
    coords: { x: '126.8948', y: '37.5169' },
    gradient: 'g-mullae',
    defaultSearchVolume: 60,
    defaultPopulationDensity: 50,
  },
];

export const REGION_CATALOG_BY_ID = Object.fromEntries(
  REGION_CATALOG.map((region) => [region.id, region]),
) as Record<string, RegionCatalogItem>;

export function getRegionGradient(regionId: string) {
  return REGION_CATALOG_BY_ID[regionId]?.gradient ?? 'g-seongsu';
}
