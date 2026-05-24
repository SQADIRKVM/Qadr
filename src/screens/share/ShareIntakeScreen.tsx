import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import { useShareIntentContext } from 'expo-share-intent';
import { MindShareSuccessOverlay, type MindShareOverlayPhase } from '../../components/mind/MindShareSuccessOverlay';
import { MindShareTagNotesSheet } from '../../components/mind/MindShareTagNotesSheet';
import { saveSharedPayloadToMind } from '../../services/mind/shareSave';
import { parseShareIntentPayload } from '../../utils/sharePayload';
import { hapticLight } from '../../utils/haptics';
import { isWebPlatform } from '../../utils/webLayout';

interface ShareIntakeScreenProps {
  /** When false, share handling is disabled (web / Expo Go). */
  enabled?: boolean;
}

/**
 * Full-screen share intake: auto-save shared URL to Mind, MyMind-style confirmation overlay.
 */
export const ShareIntakeScreen: React.FC<ShareIntakeScreenProps> = ({ enabled = true }) => {
  const { hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntentContext();
  const [phase, setPhase] = useState<MindShareOverlayPhase>('saving');
  const [itemId, setItemId] = useState<string | null>(null);
  const [tagSheetOpen, setTagSheetOpen] = useState(false);
  const savingRef = useRef(false);

  const visible = enabled && hasShareIntent && !isWebPlatform();

  const finish = useCallback(() => {
    setTagSheetOpen(false);
    setItemId(null);
    setPhase('saving');
    savingRef.current = false;
    resetShareIntent();
  }, [resetShareIntent]);

  const runSave = useCallback(async () => {
    if (!shareIntent || savingRef.current) return;
    savingRef.current = true;
    setPhase('saving');

    const payload = parseShareIntentPayload({
      text: shareIntent.text,
      webUrl: shareIntent.webUrl,
      meta: shareIntent.meta,
    });

    const result = await saveSharedPayloadToMind(payload);
    if (result.ok) {
      hapticLight();
      setItemId(result.itemId);
      setPhase('success');
    } else {
      setPhase('error');
      savingRef.current = false;
    }
  }, [shareIntent]);

  useEffect(() => {
    if (visible && shareIntent && phase === 'saving' && !savingRef.current) {
      void runSave();
    }
  }, [visible, shareIntent, phase, runSave]);

  useEffect(() => {
    if (error) {
      setPhase('error');
      savingRef.current = false;
    }
  }, [error]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (tagSheetOpen) {
        setTagSheetOpen(false);
        return true;
      }
      finish();
      return true;
    });
    return () => sub.remove();
  }, [visible, tagSheetOpen, finish]);

  if (!visible) return null;

  return (
    <>
      <MindShareSuccessOverlay
        visible={!tagSheetOpen}
        phase={phase}
        errorMessage={
          error
            ? 'Share failed. Open Qadr and try again.'
            : "Couldn't save this link. Open Qadr and paste the URL in Mind."
        }
        onAddTagsNotes={() => {
          hapticLight();
          setTagSheetOpen(true);
        }}
        onDismiss={finish}
        onRetry={phase === 'error' ? () => void runSave() : undefined}
      />
      <MindShareTagNotesSheet
        visible={tagSheetOpen}
        itemId={itemId}
        onClose={() => setTagSheetOpen(false)}
        onDone={finish}
      />
    </>
  );
};
