'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSavedPlaces } from '@/hooks/useSavedPlaces';
import { useSaveMutation } from '@/hooks/useSaveMutation';
import { AuthModal } from '@/components/AuthModal';

type Props = { placeId: string };

export function SaveButton({ placeId }: Props) {
  const user = useAuthStore((s) => s.user);
  const [showModal, setShowModal] = useState(false);

  const { data: savedIds = [] } = useSavedPlaces(user?.id);
  const { mutate: toggleSave, isPending } = useSaveMutation();

  const isSaved = savedIds.includes(placeId);

  function handleClick() {
    if (!user) {
      setShowModal(true);
      return;
    }
    toggleSave(placeId);
  }

  function handleLoginSuccess() {
    toggleSave(placeId);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
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
      />
    </>
  );
}
