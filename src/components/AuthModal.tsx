'use client';

import { useEffect, useState } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import type { User, Session } from '@supabase/supabase-js';

type OAuthProvider = 'kakao' | 'google';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
  onLoginRedirect?: () => void;
};

export function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  onLoginRedirect,
}: Props) {
  const setUser = useAuthStore((s) => s.setUser);
  const [pendingProvider, setPendingProvider] = useState<OAuthProvider | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleMockLogin() {
    setUser(
      { id: 'mock-user-1', email: 'mock@datemap.app' } as User,
      { access_token: 'mock-token' } as Session,
    );
    onClose();
    onLoginSuccess?.();
  }

  function handleOAuthLogin(provider: OAuthProvider) {
    if (!isSupabaseConfigured) {
      handleMockLogin();
      return;
    }

    setPendingProvider(provider);
    onLoginRedirect?.();

    const nextPath = `${window.location.pathname}${window.location.search}`;
    window.location.assign(
      `/api/auth?provider=${provider}&next=${encodeURIComponent(nextPath)}`,
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-sm bg-white rounded-t-3xl px-6 pt-5 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />

        <h2
          id="auth-modal-title"
          className="text-[20px] font-black text-gray-900 text-center mb-1.5"
        >
          로그인이 필요해요
        </h2>
        <p className="text-[13px] text-gray-400 text-center mb-7">
          장소를 저장하려면 로그인해 주세요.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleOAuthLogin('kakao')}
            disabled={pendingProvider !== null}
            className="w-full py-3.5 bg-[#FEE500] text-gray-900 font-bold text-[15px] rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pendingProvider === 'kakao' ? '카카오 연결 중...' : '카카오로 로그인'}
          </button>
          <button
            type="button"
            onClick={() => handleOAuthLogin('google')}
            disabled={pendingProvider !== null}
            className="w-full py-3.5 bg-white border border-gray-200 text-gray-900 font-bold text-[15px] rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pendingProvider === 'google' ? '구글 연결 중...' : '구글로 로그인'}
          </button>
        </div>

        {!isSupabaseConfigured && (
          <p className="mt-4 text-center text-[11px] leading-5 text-gray-400">
            Supabase 환경변수가 없어 개발용 로그인으로 진행돼요.
          </p>
        )}

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
