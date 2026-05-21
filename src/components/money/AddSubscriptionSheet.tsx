import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { format, addMonths } from 'date-fns';
import { AppText } from '../primitives/AppText';
import { UnderlineInput } from '../primitives/UnderlineInput';
import { Button } from '../primitives/Button';
import type { BillingCycle, Subscription } from '../../types';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

const CYCLES: BillingCycle[] = ['weekly', 'monthly', 'yearly'];

interface AddSubscriptionSheetProps {
  sheetRef: React.RefObject<BottomSheet | null>;
  editing?: Subscription | null;
  onSave: (data: {
    name: string;
    amount: number;
    cycle: BillingCycle;
    nextDueDate: string;
    note?: string;
  }) => void;
  onDelete?: (id: string) => void;
  onToggleActive?: (id: string) => void;
  onMarkPaid?: (id: string) => void;
  onDismiss: () => void;
}

export const AddSubscriptionSheet: React.FC<AddSubscriptionSheetProps> = ({
  sheetRef,
  editing,
  onSave,
  onDelete,
  onToggleActive,
  onMarkPaid,
  onDismiss,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [nextDueDate, setNextDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');

  const resetForm = useCallback(() => {
    if (editing) {
      setName(editing.name);
      setAmount(String(editing.amount));
      setCycle(editing.cycle);
      setNextDueDate(editing.nextDueDate);
      setNote(editing.note ?? '');
    } else {
      setName('');
      setAmount('');
      setCycle('monthly');
      setNextDueDate(format(addMonths(new Date(), 1), 'yyyy-MM-dd'));
      setNote('');
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
    const trimmed = name.trim();
    const parsed = parseFloat(amount.replace(/,/g, ''));
    if (!trimmed || !Number.isFinite(parsed) || parsed <= 0) return;
    onSave({
      name: trimmed,
      amount: parsed,
      cycle,
      nextDueDate: nextDueDate.trim() || format(new Date(), 'yyyy-MM-dd'),
      note: note.trim() || undefined,
    });
    sheetRef.current?.close();
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={['55%']}
      enablePanDownToClose
      onChange={handleChange}
      backgroundStyle={styles.sheetBg}
    >
      <BottomSheetView style={styles.sheet}>
        <AppText variant="label-sm" style={styles.title}>
          {editing ? 'EDIT SUBSCRIPTION' : 'ADD SUBSCRIPTION'}
        </AppText>
        <UnderlineInput label="NAME" value={name} onChangeText={setName} autoCapitalize="words" />
        <UnderlineInput
          label="AMOUNT"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <AppText variant="label-sm" style={styles.fieldLabel}>
          BILLING CYCLE
        </AppText>
        <View style={styles.cycleRow}>
          {CYCLES.map((c) => (
            <Pressable
              key={c}
              onPress={() => setCycle(c)}
              style={[styles.cyclePill, cycle === c && styles.cyclePillActive]}
            >
              <AppText
                variant="label-sm"
                style={[styles.cycleText, cycle === c && styles.cycleTextActive]}
              >
                {c.toUpperCase()}
              </AppText>
            </Pressable>
          ))}
        </View>
        <UnderlineInput
          label="NEXT DUE (YYYY-MM-DD)"
          value={nextDueDate}
          onChangeText={setNextDueDate}
          autoCapitalize="none"
        />
        <UnderlineInput label="NOTE (OPTIONAL)" value={note} onChangeText={setNote} />
        <Button label={editing ? 'SAVE CHANGES' : 'ADD SUBSCRIPTION'} onPress={save} />
        {editing && onMarkPaid ? (
          <Pressable
            style={styles.secondaryBtn}
            onPress={() => {
              onMarkPaid(editing.id);
              sheetRef.current?.close();
            }}
          >
            <AppText variant="label-sm" style={styles.markPaidText}>
              MARK PAID — ADVANCE DUE DATE
            </AppText>
          </Pressable>
        ) : null}
        {editing && onToggleActive ? (
          <Pressable
            style={styles.secondaryBtn}
            onPress={() => {
              onToggleActive(editing.id);
              sheetRef.current?.close();
            }}
          >
            <AppText variant="label-sm" style={styles.secondaryText}>
              {editing.active ? 'PAUSE SUBSCRIPTION' : 'RESUME SUBSCRIPTION'}
            </AppText>
          </Pressable>
        ) : null}
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
  fieldLabel: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  cycleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cyclePill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: spacing.pillRadius,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.cardBg,
  },
  cyclePillActive: {
    backgroundColor: colors.inverseSurface,
    borderColor: colors.inverseSurface,
  },
  cycleText: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  cycleTextActive: {
    color: colors.inverseOnSurface,
  },
  secondaryBtn: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  secondaryText: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  markPaidText: {
    color: colors.onTertiaryContainer,
    letterSpacing: 1,
  },
  deleteBtn: {
    marginTop: spacing.sm,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  deleteText: {
    color: colors.primary,
    letterSpacing: 1,
  },
});
