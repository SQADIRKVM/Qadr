import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../primitives/AppText';
import { DotMatrixText } from '../DotMatrixText';
import { ProgressRing } from '../ProgressRing';
import { BentoCard } from './BentoCard';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface VitalWidgetProps {
  label: string;
  value?: string | number;
  footer?: string;
  dotMatrix?: boolean;
  alert?: boolean;
  ring?: number;
  wide?: boolean;
}

export const VitalWidget: React.FC<VitalWidgetProps> = ({
  label,
  value,
  footer,
  dotMatrix,
  alert,
  ring,
  wide,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard style={wide ? { ...styles.widget, alignSelf: 'stretch' } : styles.widget}>
    <AppText variant="label-sm" style={styles.label}>
      {label}
    </AppText>
    <View style={styles.body}>
      {ring !== undefined && <ProgressRing progress={ring} size={56} showLabel />}
      {value !== undefined && dotMatrix && (
        <DotMatrixText value={value} size="md" alert={alert} />
      )}
      {value !== undefined && !dotMatrix && !ring && (
        <AppText variant="headline-md" style={alert ? { color: colors.accentRed } : undefined}>
          {value}
        </AppText>
      )}
    </View>
    {footer && (
      <AppText variant="body-md" muted style={styles.footer}>
        {footer}
      </AppText>
    )}
  </BentoCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  widget: { flex: 1, minHeight: 120, justifyContent: 'space-between' },
  wide: { minWidth: '100%' },
  label: { fontSize: 10, marginBottom: 8 },
  body: { flex: 1, justifyContent: 'center', paddingVertical: 8 },
  footer: { fontSize: 12, marginTop: 8 },
});
