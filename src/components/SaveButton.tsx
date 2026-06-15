'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSavedPlaces } from '@/hooks/useSavedPlaces';
import { useSaveMutation } from '@/hooks/useSaveMutation';
import { AuthModal } from '@/components/AuthModal';
import type { Place } from '@/types';

type Props = { place: Place };
const PENDING_SAVE_PLACE_KEY = 'datemap:pending-save-place';

export function SaveButton({ place }: Props) {
  const user = useAuthStore((s) => s.user);
  const [showModal, setShowModal] = useState(false);

  const { data: savedPlaces = [] } = useSavedPlaces(user?.id);
  const { mutate: toggleSave, isPending } = useSaveMutation();

  const isSaved = savedPlaces.some((p) => p.id === place.id);

  useEffect(() => {
    if (!user || isPending || isSaved || typeof window === 'undefined') return;

    const pendingPlaceId = window.sessionStorage.getItem(PENDING_SAVE_PLACE_KEY);
    if (pendingPlaceId !== place.id) return;

    window.sessionStorage.removeItem(PENDING_SAVE_PLACE_KEY);
    toggleSave({ place, shouldSave: true });
  }, [isPending, isSaved, place, toggleSave, user]);

  function handleClick() {
    if (!user) {
      setShowModal(true);
      return;
    }
    toggleSave({ place, shouldSave: !isSaved });
  }

  function handleLoginSuccess() {
    rememberPendingSave();
  }

  function rememberPendingSave() {
    window.sessionStorage.setItem(PENDING_SAVE_PLACE_KEY, place.id);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={isSaved}
        className={`w-full py-3.5 font-bold text-[15px] rounded-2xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 ${
          isSaved
            ? 'bg-white text-gray-900 border-2 border-gray-900'
            : 'bg-gray-900 text-white'
        }`}
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            저장 중...
          </span>
        ) : isSaved ? (
          '저장됨 ✓'
        ) : (
          '저장하기'
        )}
      </button>

      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onLoginSuccess={handleLoginSuccess}
        onLoginRedirect={rememberPendingSave}
      />
    </>
  );
}
