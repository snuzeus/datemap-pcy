declare global {
  interface Window {
    kakao: any;
  }
}

export function loadKakaoMap(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    if (window.kakao?.maps) return resolve();
    const existingScript = document.getElementById('kakao-map-script') as HTMLScriptElement | null;
    if (existingScript) {
      if (window.kakao?.maps) {
        window.kakao.maps.load(resolve);
      } else {
        existingScript.addEventListener('load', () => window.kakao.maps.load(resolve), { once: true });
        existingScript.addEventListener('error', reject, { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'kakao-map-script';
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`;
    script.onload = () => window.kakao.maps.load(resolve);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
