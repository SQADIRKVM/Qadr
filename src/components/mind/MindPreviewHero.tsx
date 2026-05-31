import React from 'react';
import { Platform, Pressable } from 'react-native';
import type { MindItem } from '../../types';
import { MindMediaCarousel } from './MindMediaCarousel';
import { MindInstagramEmbed } from './MindInstagramEmbed';
import { shouldPreferInstagramEmbed, shouldUseScrapedCarousel } from '../../utils/mindPreview';

interface MindPreviewHeroProps {
  item: MindItem;
  onOpenUrl?: () => void;
  height?: number;
}

export const MindPreviewHero: React.FC<MindPreviewHeroProps> = ({
  item,
  onOpenUrl,
  height = 220,
}) => {
  let hero: React.ReactNode;

  const isWeb = Platform.OS === 'web';
  if (shouldPreferInstagramEmbed(item, isWeb)) {
    hero = (
      <MindInstagramEmbed
        embedHtml={item.embedHtml!}
        height={item.platform === 'twitter' ? Math.max(height, 360) : Math.max(height, 300)}
        isTwitter={item.platform === 'twitter'}
      />
    );
  } else {
    hero = <MindMediaCarousel item={item} height={height} onOpenUrl={onOpenUrl} />;
  }

  const wrapped =
    onOpenUrl && item.url && !shouldUseScrapedCarousel(item) && !shouldPreferInstagramEmbed(item, isWeb) ? (
      <Pressable onPress={onOpenUrl}>{hero}</Pressable>
    ) : (
      hero
    );

  return wrapped;
};
