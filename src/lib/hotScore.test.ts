import { describe, it, expect } from 'vitest';
import { calcHotScore } from './hotScore';

describe('calcHotScore', () => {
  it('검색량과 혼잡도를 가중치 합산해 반환한다', () => {
    expect(calcHotScore({ searchVolume: 100, populationDensity: 100 })).toBe(100);
    expect(calcHotScore({ searchVolume: 0, populationDensity: 0 })).toBe(0);
  });

  it('검색량 가중치(0.6)가 더 높다', () => {
    const searchOnly = calcHotScore({ searchVolume: 100, populationDensity: 0 });
    const popOnly = calcHotScore({ searchVolume: 0, populationDensity: 100 });
    expect(searchOnly).toBeGreaterThan(popOnly);
  });

  it('소수점 1자리로 반올림한다', () => {
    expect(calcHotScore({ searchVolume: 33, populationDensity: 33 })).toBe(33);
  });
});
