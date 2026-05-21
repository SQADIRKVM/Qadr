import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { format } from 'date-fns';
import { AppText } from '../primitives/AppText';
import { UnderlineInput } from '../primitives/UnderlineInput';
import { Button } from '../primitives/Button';
import type { Expense } from '../../types';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface AddExpenseSheetProps {
  sheetRef: React.RefObject<BottomSheet | null>;
  editing?: Expense | null;
  onSave: (data: { amount: number; category?: string; note?: string; date: string }) => void;
  onDelete?: (id: string) => void;
  onDismiss: () => void;
}

export const AddExpenseSheet: React.FC<AddExpenseSheetProps> = ({
  sheetRef,
  editing,
  onSave,
  onDelete,
  onDismiss,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const resetForm = useCallback(() => {
    if (editing) {
      setAmount(String(editing.amount));
      setCategory(editing.category ?? '');
      setNote(editing.note ?? '');
      setDate(editing.date);
    } else {
      setAmount('');
      setCategory('');
      setNote('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [editing]);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  const handleChange = useCallback(
    (index: number) => {
      if (index < 0) {
        onDismiss();
      } else {
        resetForm();
      }
    },
    [onDismiss, resetForm],
  );

  const save = () => {
    const parsed = parseFloat(amount.replace(/,/g, ''));
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    onSave({
      amount: parsed,
      category: category.trim() || undefined,
      note: note.trim() || undefined,
      date: date.trim() || format(new Date(), 'yyyy-MM-dd'),
    });
    sheetRef.current?.close();
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={['48%']}
      enablePanDownToClose
      onChange={handleChange}
      backgroundStyle={styles.sheetBg}
    >
      <BottomSheetView style={styles.sheet}>
        <AppText variant="label-sm" style={styles.title}>
          {editing ? 'EDIT EXPENSE' : 'ADD EXPENSE'}
        </AppText>
        <UnderlineInput
          label="AMOUNT"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <UnderlineInput
          label="CATEGORY (OPTIONAL)"
          value={category}
          onChangeText={setCategory}
          autoCapitalize="words"
        />
        <UnderlineInput label="NOTE (OPTIONAL)" value={note} onChangeText={setNote} />
        <UnderlineInput
          label="DATE (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
          autoCapitalize="none"
        />
        <Button label={editing ? 'SAVE CHANGES' : 'ADD EXPENSE'} onPress={save} />
        {editing && onDelete ? (
          <Pressable
            style={styles.deleteBtn}
            onPress={() => {
              onDelete(editing.id);
              sheetRef.current?.close();
            }}
          >
            <AppText variant="label-sm" style={styles.deleteText}>
              REMOVE
            </AppText>
          </Pressable>
        ) : null}
      </BottomSheetView>
    </BottomSheet>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  sheetBg: {
    backgroundColor: colors.surfaceContainer,
  },
  sheet: {
    flex: 1,
    paddingHorizontal: spacing.screenMargin,
    paddingBottom: spacing.lg,
  },
  title: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  deleteBtn: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  deleteText: {
    color: colors.primary,
    letterSpacing: 1,
  },
});
