'use client';

import { useEffect, useRef } from 'react';
import {
  loadKakaoMap,
  type KakaoMapInstance,
  type KakaoMarkerInstance,
  type KakaoPolylineInstance,
} from '@/lib/kakao';

type Marker = {
  lat: number;
  lng: number;
  label?: string;
};

type Props = {
  markers?: Marker[];
  center?: { lat: number; lng: number };
  path?: Marker[];
  className?: string;
};

export default function KakaoMap({ markers = [], center, path = [], className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const markersRef = useRef<KakaoMarkerInstance[]>([]);
  const polylineRef = useRef<KakaoPolylineInstance | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    loadKakaoMap()
      .then(() => {
        const kakao = window.kakao;
        if (!kakao?.maps || !containerRef.current) return;

        const defaultCenter = center ?? markers[0] ?? { lat: 37.5445, lng: 127.0557 };

        const map = new kakao.maps.Map(containerRef.current, {
          center: new kakao.maps.LatLng(defaultCenter.lat, defaultCenter.lng),
          level: 4,
        });
        mapRef.current = map;

        // 마커 렌더링
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = markers.map((m) => {
          const marker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(m.lat, m.lng),
            map,
          });
          return marker;
        });

        polylineRef.current?.setMap(null);
        const linePath = path.map((point) => new kakao.maps.LatLng(point.lat, point.lng));
        polylineRef.current = linePath.length >= 2
          ? new kakao.maps.Polyline({
              path: linePath,
              strokeWeight: 4,
              strokeColor: '#111827',
              strokeOpacity: 0.85,
              strokeStyle: 'solid',
              map,
            })
          : null;

        const boundsTargets = path.length >= 2 ? path : markers;
        // 마커나 경로가 여러 개면 전체가 보이도록 bounds 조정
        if (boundsTargets.length > 1) {
          const bounds = new kakao.maps.LatLngBounds();
          boundsTargets.forEach((m) => bounds.extend(new kakao.maps.LatLng(m.lat, m.lng)));
          map.setBounds(bounds);
        }
      })
      .catch((err) => {
        console.error('[KakaoMap] 로드 실패:', err);
      });

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      polylineRef.current?.setMap(null);
      polylineRef.current = null;
    };
  }, [markers, center, path]);

  return (
    <div className={`relative ${className}`}>
      <div ref={containerRef} className="w-full h-full" />
      {/* 카카오맵 키 미설정 시 fallback */}
      {!process.env.NEXT_PUBLIC_KAKAO_MAP_KEY && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <p className="text-gray-400 text-xs">지도 준비 중</p>
        </div>
      )}
    </div>
  );
}
