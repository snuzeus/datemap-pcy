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
    let mounted = true;

    if (!containerRef.current) return undefined;

    loadKakaoMap()
      .then(() => {
        const kakao = window.kakao;
        if (!mounted || !kakao?.maps || !containerRef.current) return;

        const defaultCenter = center ?? markers[0] ?? { lat: 37.5445, lng: 127.0557 };

        const map = new kakao.maps.Map(containerRef.current, {
          center: new kakao.maps.LatLng(defaultCenter.lat, defaultCenter.lng),
          level: 4,
        });
        mapRef.current = map;

        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = markers.map((markerPoint) => (
          new kakao.maps.Marker({
            position: new kakao.maps.LatLng(markerPoint.lat, markerPoint.lng),
            map,
          })
        ));

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
        if (boundsTargets.length > 1) {
          const bounds = new kakao.maps.LatLngBounds();
          boundsTargets.forEach((point) => bounds.extend(new kakao.maps.LatLng(point.lat, point.lng)));
          map.setBounds(bounds);
        }
      })
      .catch((err) => {
        console.error('[KakaoMap] load failed:', err);
      });

    return () => {
      mounted = false;
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      polylineRef.current?.setMap(null);
      polylineRef.current = null;
      mapRef.current = null;
    };
  }, [markers, center, path]);

  return (
    <div className={`relative ${className}`}>
      <div ref={containerRef} className="h-full w-full" />
      {!process.env.NEXT_PUBLIC_KAKAO_MAP_KEY && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-xs text-gray-400">지도 준비 중</p>
        </div>
      )}
    </div>
  );
}
