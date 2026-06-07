import dynamic from 'next/dynamic';

// SSR 비활성화 — window.kakao 사용하기 때문
const KakaoMapDynamic = dynamic(() => import('./KakaoMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <p className="text-gray-400 text-xs">지도 불러오는 중...</p>
    </div>
  ),
});

export default KakaoMapDynamic;
