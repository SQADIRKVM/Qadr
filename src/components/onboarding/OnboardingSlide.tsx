import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../primitives/AppText';
import { BentoCard } from '../layout/BentoCard';
import { spacing } from '../../theme/spacing';
import { glassCardBase } from '../../theme/glass';
import type { OnboardingSlideData } from '../../screens/onboarding/onboardingSlides';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface OnboardingSlideProps {
  slide: OnboardingSlideData;
  pageWidth: number;
  pageHeight: number;
}

export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  slide,
  pageWidth,
  pageHeight,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const glowSize = pageWidth * 0.85;

  return (
    <View style={[styles.page, { width: pageWidth, minHeight: pageHeight }]}>
      <View style={styles.glowLayer}>
        <LinearGradient
          colors={['rgba(198, 198, 198, 0.14)', 'rgba(198, 198, 198, 0)']}
          style={[
            styles.glowBlob,
            {
              width: glowSize,
              height: glowSize,
              borderRadius: glowSize / 2,
            },
          ]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
        />
      </View>

      <BentoCard style={[styles.glassCard, glassCardBase(colors)]}>
        <View style={styles.iconRing}>
          <MaterialCommunityIcons
            name={slide.icon}
            size={48}
            color={colors.primary}
          />
        </View>
      </BentoCard>

      <View style={styles.textLayer}>
        <AppText variant="headline-md" style={styles.title}>
          {slide.title}
        </AppText>
        <AppText variant="body-md" muted style={styles.body}>
          {slide.body}
        </AppText>
      </View>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: spacing.screenMargin,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  glowBlob: {},
  glassCard: {
    width: '100%',
    maxWidth: 320,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: 'rgba(229, 226, 225, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  textLayer: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  title: {
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    textAlign: 'center',
    lineHeight: 22,
  },
});
