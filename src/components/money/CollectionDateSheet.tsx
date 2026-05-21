import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { format } from 'date-fns';
import { AppText } from '../primitives/AppText';
import { UnderlineInput } from '../primitives/UnderlineInput';
import { Button } from '../primitives/Button';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface CollectionDateSheetProps {
  sheetRef: React.RefObject<BottomSheet | null>;
  initialDate?: string;
  onSave: (date: string | undefined) => void;
}

export const CollectionDateSheet: React.FC<CollectionDateSheetProps> = ({
  sheetRef,
  initialDate,
  onSave,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [date, setDate] = useState(initialDate ?? format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    setDate(initialDate ?? format(new Date(), 'yyyy-MM-dd'));
  }, [initialDate]);

  const handleChange = useCallback((index: number) => {
    if (index >= 0) setDate(initialDate ?? format(new Date(), 'yyyy-MM-dd'));
  }, [initialDate]);

  const save = () => {
    onSave(date.trim() || undefined);
    sheetRef.current?.close();
  };

  const clear = () => {
    onSave(undefined);
    sheetRef.current?.close();
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={['35%']}
      enablePanDownToClose
      onChange={handleChange}
      backgroundStyle={styles.sheetBg}
    >
      <BottomSheetView style={styles.sheet}>
        <AppText variant="label-sm" style={styles.title}>
          COLLECTION DATE
        </AppText>
        <UnderlineInput
          label="TARGET DATE (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
          autoCapitalize="none"
        />
        <Button label="SAVE" onPress={save} />
        {initialDate ? (
          <Button label="CLEAR DATE" onPress={clear} variant="secondary" />
        ) : null}
      </BottomSheetView>
    </BottomSheet>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  sheetBg: { backgroundColor: colors.surfaceContainer },
  sheet: { paddingHorizontal: spacing.screenMargin, paddingBottom: spacing.lg },
  title: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
});
