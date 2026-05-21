import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import { ScreenShell, SubScreenHeader } from '../../components/layout';
import { MindCard } from '../../components/mind';
import { AppText } from '../../components/primitives/AppText';
import { Button } from '../../components/primitives/Button';
import { useMindStore } from '../../stores/useMindStore';
import type { IdeasStackParamList } from '../../navigation/types';
import { pickSerendipityItem, getActiveMindItems } from '../../utils/mindVault';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

const DOT_COUNT = 5;

export const MindSerendipityScreen = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<StackNavigationProp<IdeasStackParamList>>();
  const { items, archiveItem } = useMindStore();
  const [poolKey, setPoolKey] = useState(0);
  const [dotIndex, setDotIndex] = useState(0);

  const poolSize = getActiveMindItems(items).filter((i) => {
    const age = Date.now() - new Date(i.createdAt).getTime();
    return age > 30 * 86400000;
  }).length;

  const current = useMemo(() => pickSerendipityItem(items), [items, poolKey]);

  const next = () => {
    setPoolKey((k) => k + 1);
    setDotIndex((d) => (d + 1) % DOT_COUNT);
  };

  const onKeep = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    next();
  };

  const onArchive = async () => {
    if (current) archiveItem(current.id);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    next();
  };

  return (
    <ScreenShell header="none" scroll>
      <SubScreenHeader title="Rediscover" onBack={() => navigation.goBack()} />
      <AppText variant="body-md" muted style={styles.sub}>
        Something you saved 30+ days ago. Keep it or archive.
      </AppText>

      {!current ? (
        <View style={styles.empty}>
          <AppText variant="headline-md" style={styles.emptyTitle}>
            Nothing to rediscover yet.
          </AppText>
          <AppText variant="body-md" muted>
            Save more captures and check back later.
          </AppText>
        </View>
      ) : (
        <View style={styles.body}>
          <View style={styles.cardWrap}>
            <MindCard
              item={current}
              onPress={() => {
                hapticLight();
                navigation.navigate('MindFocus', { id: current.id });
              }}
            />
          </View>

          <View style={styles.dots}>
            {Array.from({ length: Math.min(DOT_COUNT, Math.max(1, poolSize)) }).map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === dotIndex % DOT_COUNT && styles.dotActive]}
              />
            ))}
          </View>

          <View style={styles.actions}>
            <Button label="KEEP" variant="secondary" onPress={onKeep} />
            <Button label="ARCHIVE" variant="destructive" onPress={onArchive} />
          </View>
        </View>
      )}
    </ScreenShell>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  sub: {
    marginBottom: spacing.lg,
    lineHeight: 22,
    paddingHorizontal: spacing.screenMargin,
  },
  body: {
    gap: spacing.lg,
    paddingHorizontal: spacing.screenMargin,
    paddingBottom: spacing.xl,
  },
  cardWrap: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.outlineVariant,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actions: { gap: spacing.sm },
  empty: {
    marginTop: 80,
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    color: colors.onSurface,
    textAlign: 'center',
  },
});
