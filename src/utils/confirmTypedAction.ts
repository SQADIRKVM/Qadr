import { useDialogStore } from '../stores/useDialogStore';

/** GitHub-style confirmation: user must type an exact phrase to enable the action. */
export function confirmTypedAction(opts: {
  title: string;
  message?: string;
  confirmPhrase: string;
  phraseHint?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}): void {
  useDialogStore.getState().showTypedConfirm(opts);
}
