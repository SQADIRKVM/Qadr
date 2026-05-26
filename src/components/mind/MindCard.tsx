import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { MindPlatformOverlay } from './MindPlatformOverlay';
import type { MindItem } from '../../types';
import { getMindCardSubtitle, getMindDisplayTitle } from '../../utils/mindTitle';
import { getMindPreviewSlides } from '../../utils/mindPlatformBadge';
import { getMindContentKind } from '../../utils/mindUrl';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface MindCardProps {
  item: MindItem;
  onPress: () => void;
}

export const MindCard: React.FC<MindCardProps> = ({ item, onPress }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const slides = getMindPreviewSlides(item);
  const thumbUri = slides[0] ?? item.imageUri;
  const showThumb = !!thumbUri;
  const kind = getMindContentKind(item);
  const showPlay = showThumb && (kind === 'reel' || kind === 'video');
  const subtitle = getMindCardSubtitle(item);
  const displayTitle = getMindDisplayTitle(item);

  const getThumbnailAspectRatio = () => {
    if (kind === 'reel' || item.isReel) {
      return 0.65; // Tall vertical video
    }
    if (kind === 'video') {
      return 1.6; // Widescreen horizontal video
    }
    // Stagger other image types dynamically for a natural Pinterest flow
    const charCodeSum = item.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return charCodeSum % 2 === 0 ? 0.85 : 1.1;
  };

  return (
    <BentoCard deep onPress={onPress} style={[styles.card, showThumb && styles.cardMedia]}>
      {showThumb ? (
        <View style={styles.thumbWrap}>
          <Image
            source={{ uri: thumbUri }}
            style={[styles.thumb, { aspectRatio: getThumbnailAspectRatio() }]}
            resizeMode="cover"
          />
          {showPlay ? (
            <View style={styles.playOverlay} pointerEvents="none">
              <View style={styles.playCircle}>
                <MaterialIcons name="play-arrow" size={28} color={colors.onPrimary} />
              </View>
            </View>
          ) : null}
          <MindPlatformOverlay item={item} />
        </View>
      ) : null}

      <View style={styles.body}>
        <AppText variant="headline-md" style={styles.title} numberOfLines={showThumb ? 1 : 2}>
          {displayTitle}
        </AppText>
        {subtitle ? (
          <AppText variant="body-md" muted style={styles.desc} numberOfLines={showThumb ? 2 : 3}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
    </BentoCard>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    padding: spacing.sm,
    gap: spacing.sm,
    overflow: 'hidden',
    minHeight: 100,
  },
  cardMedia: {
    minHeight: 160,
    padding: spacing.xs,
  },
  thumbWrap: {
    position: 'relative',
    width: '100%',
  },
  thumb: {
    width: '100%',
    aspectRatio: 0.85,
    borderRadius: spacing.cardRadius - 2,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.cardRadius - 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  playCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
  },
  body: {
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
  },
  title: {
    color: colors.onSurface,
    fontSize: 15,
  },
  desc: {
    lineHeight: 18,
    fontSize: 12,
  },
});
