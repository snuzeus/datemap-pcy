'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSavedPlaces } from '@/hooks/useSavedPlaces';
import { useSaveMutation } from '@/hooks/useSaveMutation';
import { AuthModal } from '@/components/AuthModal';
import type { Place } from '@/types';

type Props = { place: Place };
const PENDING_SAVE_PLACE_KEY = 'datemap:pending-save-place';

function getSaveErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return '저장 요청이 지연되고 있어요. Supabase 테이블 설정을 확인해 주세요.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '저장에 실패했어요. 잠시 후 다시 시도해 주세요.';
}

export function SaveButton({ place }: Props) {
  const user = useAuthStore((s) => s.user);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const failsafeTimerRef = useRef<number | null>(null);

  const { data: savedPlaces = [] } = useSavedPlaces(user?.id);
  const { mutateAsync: toggleSave } = useSaveMutation();

  const isSaved = savedPlaces.some((p) => p.id === place.id);

  useEffect(() => {
    return () => {
      if (failsafeTimerRef.current) {
        window.clearTimeout(failsafeTimerRef.current);
      }
    };
  }, []);

  const clearFailsafeTimer = useCallback(() => {
    if (!failsafeTimerRef.current) return;
    window.clearTimeout(failsafeTimerRef.current);
    failsafeTimerRef.current = null;
  }, []);

  const runToggle = useCallback(async (shouldSave: boolean) => {
    clearFailsafeTimer();
    setIsSaving(true);
    setErrorMessage(null);

    failsafeTimerRef.current = window.setTimeout(() => {
      setIsSaving(false);
      setErrorMessage(null);
      failsafeTimerRef.current = null;
    }, 12000);

    try {
      await toggleSave({ place, shouldSave });
    } catch (error) {
      setErrorMessage(getSaveErrorMessage(error));
    } finally {
      clearFailsafeTimer();
      setIsSaving(false);
    }
  }, [clearFailsafeTimer, place, toggleSave]);

  useEffect(() => {
    if (!user || isSaving || isSaved || typeof window === 'undefined') return;

    const pendingPlaceId = window.sessionStorage.getItem(PENDING_SAVE_PLACE_KEY);
    if (pendingPlaceId !== place.id) return;

    window.sessionStorage.removeItem(PENDING_SAVE_PLACE_KEY);
    runToggle(true);
  }, [isSaving, isSaved, place.id, runToggle, user]);

  function handleClick() {
    if (!user) {
      setShowModal(true);
      return;
    }

    runToggle(!isSaved);
  }

  function handleLoginSuccess() {
    rememberPendingSave();
  }

  function rememberPendingSave() {
    window.sessionStorage.setItem(PENDING_SAVE_PLACE_KEY, place.id);
  }

  return (
    <>
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleClick}
          disabled={isSaving}
          aria-pressed={isSaved}
          className={`w-full py-3.5 font-bold text-[15px] rounded-2xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 ${
            isSaved
              ? 'bg-white text-gray-900 border-2 border-gray-900'
              : 'bg-gray-900 text-white'
          }`}
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              저장 중...
            </span>
          ) : isSaved ? (
            '저장됨'
          ) : (
            '저장하기'
          )}
        </button>

        {errorMessage && (
          <p className="text-center text-[12px] leading-5 text-red-500" role="alert">
            {errorMessage}
          </p>
        )}
      </div>

      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onLoginSuccess={handleLoginSuccess}
        onLoginRedirect={rememberPendingSave}
      />
    </>
  );
}
