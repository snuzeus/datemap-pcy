'use client';

import { useAuthStore } from '@/stores/useAuthStore';
import type { User, Session } from '@supabase/supabase-js';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
};

export function AuthModal({ isOpen, onClose, onLoginSuccess }: Props) {
  const setUser = useAuthStore((s) => s.setUser);

  if (!isOpen) return null;

  // Feature 7에서 Supabase Auth로 교체 예정
  function handleMockLogin() {
    setUser(
      { id: 'mock-user-1', email: 'mock@datemap.app' } as User,
      { access_token: 'mock-token' } as Session,
    );
    onClose();
    onLoginSuccess?.();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-sm bg-white rounded-t-3xl px-6 pt-5 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />

        <h2 className="text-[20px] font-black text-gray-900 text-center mb-1.5">
          로그인이 필요해요
        </h2>
        <p className="text-[13px] text-gray-400 text-center mb-7">
          장소를 저장하려면 로그인해 주세요.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleMockLogin}
            className="w-full py-3.5 bg-[#FEE500] text-gray-900 font-bold text-[15px] rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            카카오로 로그인
          </button>
          <button
            type="button"
            onClick={handleMockLogin}
            className="w-full py-3.5 bg-white border border-gray-200 text-gray-900 font-bold text-[15px] rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            구글로 로그인
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-3 text-[13px] text-gray-400 outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
