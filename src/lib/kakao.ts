export type KakaoLatLngInstance = unknown;

export type KakaoMapInstance = {
  setBounds: (bounds: KakaoLatLngBoundsInstance) => void;
};

export type KakaoPolylineInstance = {
  setMap: (map: KakaoMapInstance | null) => void;
};

export type KakaoMarkerInstance = {
  setMap: (map: KakaoMapInstance | null) => void;
};

export type KakaoLatLngBoundsInstance = {
  extend: (latLng: KakaoLatLngInstance) => void;
};

type KakaoMaps = {
  load: (callback: () => void) => void;
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLngInstance; level: number },
  ) => KakaoMapInstance;
  LatLng: new (lat: number, lng: number) => KakaoLatLngInstance;
  Marker: new (options: {
    position: KakaoLatLngInstance;
    map: KakaoMapInstance;
  }) => KakaoMarkerInstance;
  Polyline: new (options: {
    path: KakaoLatLngInstance[];
    strokeWeight: number;
    strokeColor: string;
    strokeOpacity: number;
    strokeStyle: string;
    map: KakaoMapInstance;
  }) => KakaoPolylineInstance;
  LatLngBounds: new () => KakaoLatLngBoundsInstance;
};

declare global {
  interface Window {
    kakao?: { maps: KakaoMaps };
  }
}

export function loadKakaoMap(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    if (window.kakao?.maps) return resolve();
    if (!process.env.NEXT_PUBLIC_KAKAO_MAP_KEY) {
      reject(new Error('Kakao map key is not configured'));
      return;
    }

    const loadMaps = () => {
      if (!window.kakao?.maps) {
        reject(new Error('Kakao Maps SDK is not available'));
        return;
      }
      window.kakao.maps.load(resolve);
    };

    const existingScript = document.getElementById('kakao-map-script') as HTMLScriptElement | null;
    if (existingScript) {
      if (window.kakao?.maps) {
        window.kakao.maps.load(resolve);
      } else {
        existingScript.addEventListener('load', loadMaps, { once: true });
        existingScript.addEventListener('error', reject, { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'kakao-map-script';
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`;
    script.onload = loadMaps;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
