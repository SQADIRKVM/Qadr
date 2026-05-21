import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
} from 'react-native';
import { AppText } from '../../components/primitives/AppText';
import { Button } from '../../components/primitives/Button';
import { OnboardingSlide } from '../../components/onboarding/OnboardingSlide';
import {
  AuthScreenShell,
  useAuthPageWidth,
} from '../../components/auth/AuthScreenShell';
import { ONBOARDING_SLIDES } from './onboardingSlides';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

const FOOTER_APPROX_HEIGHT = 120;

interface OnboardingScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  onSkip,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const pageWidth = useAuthPageWidth();
  const { height } = useWindowDimensions();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const isLast = index === ONBOARDING_SLIDES.length - 1;

  const pageHeight = useMemo(
    () => Math.max(height - FOOTER_APPROX_HEIGHT, 320),
    [height],
  );

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
    if (i !== index && i >= 0 && i < ONBOARDING_SLIDES.length) {
      setIndex(i);
    }
  };

  const goNext = () => {
    if (isLast) {
      onComplete();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  return (
    <AuthScreenShell>
      <View style={styles.body}>
        <Pressable onPress={onSkip} style={styles.skip} hitSlop={12}>
          <AppText variant="label-sm" style={styles.skipText}>
            SKIP
          </AppText>
        </Pressable>

        <FlatList
          key={pageWidth}
          ref={listRef}
          style={styles.list}
          data={ONBOARDING_SLIDES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OnboardingSlide
              slide={item}
              pageWidth={pageWidth}
              pageHeight={pageHeight}
            />
          )}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          bounces={false}
          getItemLayout={(_, i) => ({
            length: pageWidth,
            offset: pageWidth * i,
            index: i,
          })}
        />

        <View style={styles.footer}>
          <View style={styles.dots}>
            {ONBOARDING_SLIDES.map((slide, i) => (
              <View
                key={slide.id}
                style={[styles.dot, i === index && styles.dotActive]}
              />
            ))}
          </View>
          <Button
            label={isLast ? 'GET STARTED' : 'NEXT'}
            onPress={goNext}
            style={styles.cta}
          />
        </View>
      </View>
    </AuthScreenShell>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  body: {
    flex: 1,
    width: '100%',
  },
  skip: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.screenMargin,
    zIndex: 2,
  },
  skipText: {
    color: colors.primary,
    letterSpacing: 1,
  },
  list: {
    flex: 1,
  },
  footer: {
    flexShrink: 0,
    paddingHorizontal: spacing.screenMargin,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.outlineVariant,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  cta: { width: '100%' },
});
