import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { EnergyFlowBlocks } from './EnergyFlowBlocks';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface DailyEnergyCardProps {
  blockLevels: number[];
  onMorePress?: () => void;
}

export const DailyEnergyCard: React.FC<DailyEnergyCardProps> = ({
  blockLevels,
  onMorePress,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard deep style={styles.card}>
    <View style={styles.header}>
      <View>
        <AppText variant="headline-md" style={styles.title}>
          Daily Energy
        </AppText>
        <AppText variant="label-sm" style={styles.subtitle}>
          YOUR NATURAL FLOW
        </AppText>
      </View>
      <Pressable
        onPress={() => {
          hapticLight();
          onMorePress?.();
        }}
        style={({ pressed }) => [styles.moreBtn, pressed && styles.morePressed]}
      >
        <MaterialIcons name="more-horiz" size={20} color={colors.onSurfaceVariant} />
      </Pressable>
    </View>
    <EnergyFlowBlocks levels={blockLevels} />
  </BentoCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: { padding: spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: { color: colors.onSurface },
  subtitle: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    fontSize: 10,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  moreBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  morePressed: { backgroundColor: colors.surfaceContainerHigh },
});
