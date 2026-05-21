import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Image,
  FlatList,
  Pressable,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { MindItem } from '../../types';
import { getMindPreviewSlides } from '../../utils/mindPlatformBadge';
import { getMindContentKind } from '../../utils/mindUrl';
import { MindPlatformOverlay } from './MindPlatformOverlay';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { getMindPreviewImageSources } from '../../utils/mindImageUrl';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface MindMediaCarouselProps {
  item: MindItem;
  height?: number;
  showPlay?: boolean;
  onOpenUrl?: () => void;
}

function SlideLoadFallback({
  height,
  onOpenUrl,
}: {
  height: number;
  onOpenUrl?: () => void;
}) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      style={[styles.slideFallback, { height }]}
      onPress={onOpenUrl}
      disabled={!onOpenUrl}
    >
      <LinearGradient
        colors={[colors.surfaceContainerHigh, colors.surfaceContainerLowest]}
        style={StyleSheet.absoluteFill}
      />
      <AppText variant="label-sm" muted style={styles.fallbackText}>
        {onOpenUrl ? 'Tap to open on Instagram' : 'Preview unavailable'}
      </AppText>
    </Pressable>
  );
}

function PreviewImage({
  uri,
  height,
  onError,
}: {
  uri: string;
  height: number;
  onError: () => void;
}) {
  const styles = useThemedStyles(createStyles);
  const sources = useMemo(() => getMindPreviewImageSources(uri), [uri]);
  const [sourceIndex, setSourceIndex] = useState(0);
  const resolved = sources[sourceIndex] ?? uri;

  const handleError = () => {
    if (sourceIndex + 1 < sources.length) {
      setSourceIndex((i) => i + 1);
      return;
    }
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[MindCarousel] image failed', { uri, tried: sources });
    }
    onError();
  };

  return (
    <Image
      key={resolved}
      source={{ uri: resolved }}
      style={[styles.image, { height }]}
      resizeMode="cover"
      onError={handleError}
    />
  );
}

export const MindMediaCarousel: React.FC<MindMediaCarouselProps> = ({
  item,
  height = 200,
  showPlay: showPlayProp,
  onOpenUrl,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { width: windowWidth } = useWindowDimensions();
  const slides = getMindPreviewSlides(item);
  const [index, setIndex] = useState(0);
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [failedUris, setFailedUris] = useState<Set<string>>(() => new Set());

  const markFailed = useCallback((uri: string) => {
    setFailedUris((prev) => new Set(prev).add(uri));
  }, []);

  const kind = getMindContentKind(item);
  const showPlay = showPlayProp ?? (kind === 'reel' || kind === 'video');

  const slideWidth =
    layoutWidth > 0 ? layoutWidth : Math.max(windowWidth - spacing.screenMargin * 2, 280);

  const getItemLayout = useMemo(
    () =>
      (_: unknown, i: number) => ({
        length: slideWidth,
        offset: slideWidth * i,
        index: i,
      }),
    [slideWidth],
  );

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const w = e.nativeEvent.layoutMeasurement.width;
    if (!w) return;
    const i = Math.round(e.nativeEvent.contentOffset.x / w);
    setIndex(i);
  }, []);

  if (!slides.length) {
    return (
      <View
        style={[styles.wrap, { height }]}
        onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
      >
        <LinearGradient
          colors={[colors.surfaceContainerHigh, colors.surfaceContainerLowest]}
          style={StyleSheet.absoluteFill}
        />
        <MindPlatformOverlay item={item} />
      </View>
    );
  }

  const renderHeroFallback = () => (
    <Pressable
      style={[styles.wrap, styles.fallback, { height }]}
      onPress={onOpenUrl}
      disabled={!onOpenUrl}
    >
      <LinearGradient
        colors={[colors.surfaceContainerHigh, colors.surfaceContainerLowest]}
        style={StyleSheet.absoluteFill}
      />
      <AppText variant="label-sm" muted style={styles.fallbackText}>
        {onOpenUrl ? 'Preview unavailable — tap to open' : 'Preview unavailable'}
      </AppText>
      <MindPlatformOverlay item={item} />
    </Pressable>
  );

  if (slides.length === 1) {
    if (failedUris.has(slides[0])) return renderHeroFallback();
    return (
      <View
        style={[styles.wrap, { height }]}
        onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
      >
        <PreviewImage uri={slides[0]} height={height} onError={() => markFailed(slides[0])} />
        {showPlay ? (
          <View style={styles.playOverlay} pointerEvents="none">
            <View style={styles.playCircle}>
              <MaterialIcons name="play-arrow" size={36} color={colors.onPrimary} />
            </View>
          </View>
        ) : null}
        <MindPlatformOverlay item={item} />
      </View>
    );
  }

  return (
    <View style={styles.carouselRoot}>
      <View
        style={[styles.wrap, { height }]}
        onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
      >
        <FlatList
          data={slides}
          keyExtractor={(uri, i) => `${uri}-${i}`}
          horizontal
          pagingEnabled
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={{ width: slideWidth, height }}
          contentContainerStyle={{ height }}
          getItemLayout={getItemLayout}
          renderItem={({ item: uri }) => (
            <View style={[styles.slide, { width: slideWidth, height }]}>
              {failedUris.has(uri) ? (
                <SlideLoadFallback height={height} onOpenUrl={onOpenUrl} />
              ) : (
                <PreviewImage uri={uri} height={height} onError={() => markFailed(uri)} />
              )}
            </View>
          )}
        />
        {showPlay && index === 0 ? (
          <View style={styles.playOverlay} pointerEvents="none">
            <View style={styles.playCircle}>
              <MaterialIcons name="play-arrow" size={36} color={colors.onPrimary} />
            </View>
          </View>
        ) : null}
        <MindPlatformOverlay item={item} />
      </View>
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === index ? styles.dotActive : styles.dotIdle]} />
        ))}
      </View>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  carouselRoot: {
    gap: spacing.sm,
  },
  wrap: {
    width: '100%',
    borderRadius: spacing.cardRadius,
    overflow: 'hidden',
    position: 'relative',
  },
  slide: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
  },
  slideFallback: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  playCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.outlineVariant,
  },
  dotIdle: {
    width: 6,
    opacity: 0.5,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.onSurface,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});
