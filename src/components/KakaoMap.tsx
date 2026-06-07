'use client';

import { useEffect, useRef } from 'react';
import { loadKakaoMap } from '@/lib/kakao';

type Marker = {
  lat: number;
  lng: number;
  label?: string;
};

type Props = {
  markers?: Marker[];
  center?: { lat: number; lng: number };
  className?: string;
};

export default function KakaoMap({ markers = [], center, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    loadKakaoMap()
      .then(() => {
        const kakao = window.kakao;
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

        // 마커가 여러 개면 전체가 보이도록 bounds 조정
        if (markers.length > 1) {
          const bounds = new kakao.maps.LatLngBounds();
          markers.forEach((m) => bounds.extend(new kakao.maps.LatLng(m.lat, m.lng)));
          map.setBounds(bounds);
        }
      })
      .catch((err) => {
        console.error('[KakaoMap] 로드 실패:', err);
      });

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, [markers, center]);

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
