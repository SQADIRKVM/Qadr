import { createRef } from 'react';
import * as Linking from 'expo-linking';
import type { ParamListBase } from '@react-navigation/core';
import type { LinkingOptions, NavigationContainerRef } from '@react-navigation/native';
import { ShareIntentModule, getShareExtensionKey } from 'expo-share-intent';

export const navigationRef = createRef<NavigationContainerRef<Record<string, unknown>>>();

/**
 * Subscribes to share-intent native events (iOS extension + Android ACTION_SEND).
 * ShareIntakeScreen reads payload via useShareIntentContext — no extra nav route required.
 */
export const shareIntentLinking: LinkingOptions<ParamListBase> = {
  prefixes: [],
  subscribe(listener: (url: string) => void) {
    const onReceiveURL = ({ url }: { url: string }) => {
      if (!url.includes(getShareExtensionKey())) {
        listener(url);
      }
    };

    const stateSub = ShareIntentModule?.addListener('onStateChange', (event) => {
      if (event.value === 'pending') {
        listener(Linking.createURL('/'));
      }
    });

    const valueSub = ShareIntentModule?.addListener('onChange', async () => {
      const url = await Linking.getInitialURL();
      if (url) onReceiveURL({ url });
    });

    const urlSub = Linking.addEventListener('url', onReceiveURL);
    return () => {
      stateSub?.remove();
      valueSub?.remove();
      urlSub.remove();
    };
  },
  async getInitialURL() {
    return Linking.getInitialURL();
  },
};
