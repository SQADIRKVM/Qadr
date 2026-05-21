import type { ComponentProps } from 'react';
import type MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export type OnboardingIconName = ComponentProps<
  typeof MaterialCommunityIcons
>['name'];

export interface OnboardingSlideData {
  id: string;
  title: string;
  body: string;
  icon: OnboardingIconName;
}

export const ONBOARDING_SLIDES: OnboardingSlideData[] = [
  {
    id: 'mind',
    title: 'Capture your Mind',
    body: 'Save links, ideas, and spaces in one vault.',
    icon: 'brain',
  },
  {
    id: 'habits',
    title: 'Habits, sleep, focus',
    body: 'Track energy and protect deep work.',
    icon: 'checkbox-marked-circle-outline',
  },
  {
    id: 'sync',
    title: 'Sync with Google',
    body: 'One account across devices. Sign in to enable cloud sync.',
    icon: 'cloud-sync',
  },
];
