import { useDialogStore } from '../stores/useDialogStore';

type ConfirmOptions = {
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

/** Custom in-app confirm dialog (no native Alert / window.confirm). */
export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void | Promise<void>,
  options?: ConfirmOptions,
): void {
  useDialogStore.getState().showConfirm({
    title,
    message,
    confirmLabel: options?.confirmLabel ?? 'OK',
    cancelLabel: options?.cancelLabel ?? 'Cancel',
    destructive: options?.destructive ?? false,
    onConfirm,
  });
}
