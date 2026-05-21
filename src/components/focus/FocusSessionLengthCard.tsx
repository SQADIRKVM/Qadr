import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { SegmentedPill } from '../primitives/SegmentedPill';
import type { BreakDurationPreset, FocusDurationPreset } from '../../stores/useSettingsStore';
import type { ActiveBlockMode } from '../../utils/focusMode';
import { getFocusModeMeta } from '../../utils/focusMode';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface FocusSessionLengthCardProps {
  forMode: ActiveBlockMode;
  subtitle?: string;
  focusDurationPreset: FocusDurationPreset;
  breakDurationPreset: BreakDurationPreset;
  focusDurationMinutes: number;
  breakDurationMinutes: number;
  onFocusPresetChange: (preset: FocusDurationPreset) => void;
  onBreakPresetChange: (preset: BreakDurationPreset) => void;
  onFocusMinutesChange: (minutes: number) => void;
  onBreakMinutesChange: (minutes: number) => void;
}

export const FocusSessionLengthCard: React.FC<FocusSessionLengthCardProps> = ({
  forMode,
  subtitle,
  focusDurationPreset,
  breakDurationPreset,
  focusDurationMinutes,
  breakDurationMinutes,
  onFocusPresetChange,
  onBreakPresetChange,
  onFocusMinutesChange,
  onBreakMinutesChange,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard deep style={styles.card}>
    <View style={styles.sectionHeader}>
      <AppText variant="label-sm" style={styles.sectionLabel}>
        SESSION LENGTH
      </AppText>
      <AppText variant="label-sm" style={styles.modeTag}>
        {getFocusModeMeta(forMode).label.toUpperCase()}
      </AppText>
    </View>

    {subtitle ? (
      <AppText variant="body-md" muted style={styles.subtitle}>
        {subtitle}
      </AppText>
    ) : null}

    <View style={styles.group}>
      <AppText variant="label-sm" style={styles.groupLabel}>
        FOCUS
      </AppText>
      <SegmentedPill
        variant="surface"
        options={[
          { value: '25' as FocusDurationPreset, label: '25' },
          { value: '45' as FocusDurationPreset, label: '45' },
          { value: 'custom' as FocusDurationPreset, label: 'CUSTOM' },
        ]}
        value={focusDurationPreset}
        onChange={onFocusPresetChange}
      />
      {focusDurationPreset === 'custom' ? (
        <View style={styles.customRow}>
          <TextInput
            style={styles.input}
            value={String(focusDurationMinutes)}
            onChangeText={(t) => {
              const n = parseInt(t.replace(/\D/g, ''), 10);
              if (!Number.isNaN(n)) onFocusMinutesChange(n);
            }}
            keyboardType="number-pad"
            placeholder="Minutes"
            placeholderTextColor={colors.outlineVariant}
          />
          <AppText variant="body-md" muted style={styles.minLabel}>
            min
          </AppText>
        </View>
      ) : (
        <AppText variant="body-md" muted style={styles.hint}>
          {focusDurationMinutes} minute focus block
        </AppText>
      )}
    </View>

    <View style={styles.group}>
      <AppText variant="label-sm" style={styles.groupLabel}>
        BREAK
      </AppText>
      <SegmentedPill
        variant="surface"
        options={[
          { value: '5' as BreakDurationPreset, label: '5' },
          { value: '10' as BreakDurationPreset, label: '10' },
          { value: 'custom' as BreakDurationPreset, label: 'CUSTOM' },
        ]}
        value={breakDurationPreset}
        onChange={onBreakPresetChange}
      />
      {breakDurationPreset === 'custom' ? (
        <View style={styles.customRow}>
          <TextInput
            style={styles.input}
            value={String(breakDurationMinutes)}
            onChangeText={(t) => {
              const n = parseInt(t.replace(/\D/g, ''), 10);
              if (!Number.isNaN(n)) onBreakMinutesChange(n);
            }}
            keyboardType="number-pad"
            placeholder="Minutes"
            placeholderTextColor={colors.outlineVariant}
          />
          <AppText variant="body-md" muted style={styles.minLabel}>
            min
          </AppText>
        </View>
      ) : (
        <AppText variant="body-md" muted style={styles.hint}>
          {breakDurationMinutes} minute break
        </AppText>
      )}
    </View>
  </BentoCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionLabel: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
  },
  modeTag: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1.5,
  },
  subtitle: {
    marginTop: -spacing.xs,
  },
  group: {
    gap: spacing.sm,
  },
  groupLabel: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1.5,
  },
  hint: {
    marginTop: 2,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
    width: '100%',
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 14,
  },
  minLabel: {
    flexShrink: 0,
  },
});
