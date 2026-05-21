import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '../primitives/Button';
import { spacing } from '../../theme/spacing';

interface DialogActionsProps {
  cancelLabel?: string;
  confirmLabel: string;
  destructive?: boolean;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  showCancel?: boolean;
  onCancel?: () => void;
  onConfirm: () => void;
}

export const DialogActions: React.FC<DialogActionsProps> = ({
  cancelLabel = 'Cancel',
  confirmLabel,
  destructive,
  confirmDisabled,
  confirmLoading,
  showCancel = true,
  onCancel,
  onConfirm,
}) => (
  <View style={styles.row}>
    {showCancel && onCancel ? (
      <Button
        label={cancelLabel}
        variant="secondary"
        onPress={onCancel}
        style={styles.btn}
      />
    ) : null}
    <Button
      label={confirmLabel}
      variant={destructive ? 'destructive' : 'primary'}
      onPress={onConfirm}
      disabled={confirmDisabled}
      loading={confirmLoading}
      style={styles.btn}
    />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  btn: { flex: 1, minWidth: 0 },
});
