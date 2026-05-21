import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../stores/useSettingsStore';

export const hapticLight = () => {
  if (!useSettingsStore.getState().hapticsEnabled) return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};
