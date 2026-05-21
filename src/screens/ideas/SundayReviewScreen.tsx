import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenShell, BentoCard, SubScreenHeader } from '../../components/layout';
import { AppText } from '../../components/primitives/AppText';
import { Button } from '../../components/primitives/Button';
import { useIdeaStore } from '../../stores/useIdeaStore';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

export const SundayReviewScreen = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const { ideas, archiveIdea, moveToProject, updateIdea } = useIdeaStore();
  const queue = useMemo(
    () => ideas.filter((i) => i.sundayReview || i.status === 'sunday'),
    [ideas],
  );
  const [index, setIndex] = useState(0);
  const current = queue[index];

  if (!current) {
    return (
      <ScreenShell header="none" scroll>
        <SubScreenHeader title="Sunday Review" onBack={() => navigation.goBack()} />
        <AppText variant="headline-md" style={{ textAlign: 'center', marginTop: 80 }}>
          review complete.
        </AppText>
        <Button label="BACK" onPress={() => navigation.goBack()} style={{ marginTop: 24 }} />
      </ScreenShell>
    );
  }

  const next = () => setIndex((i) => i + 1);

  return (
    <ScreenShell header="none" scroll>
      <SubScreenHeader title="Sunday Review" onBack={() => navigation.goBack()} />
      <View style={styles.dots}>
        {queue.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
      <BentoCard style={styles.card}>
        <AppText variant="headline-md">{current.title}</AppText>
        {current.description && (
          <AppText variant="body-md" muted style={{ marginTop: 8 }}>
            {current.description}
          </AppText>
        )}
      </BentoCard>
      <View style={styles.actions}>
        <Button
          label="KEEP"
          variant="secondary"
          onPress={() => {
            updateIdea(current.id, { sundayReview: false, status: 'active' });
            next();
          }}
        />
        <Button
          label="ARCHIVE"
          variant="destructive"
          onPress={() => {
            archiveIdea(current.id);
            next();
          }}
        />
        <Button
          label="→ PROJECT"
          onPress={() => {
            moveToProject(current.id);
            next();
          }}
        />
      </View>
    </ScreenShell>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 24, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.outlineVariant },
  dotActive: { backgroundColor: colors.primary },
  card: { flex: 1, marginBottom: 24, minHeight: 200 },
  actions: { gap: 8, paddingBottom: 24 },
});
