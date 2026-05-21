import { useDialogStore } from '../stores/useDialogStore';

/** Custom in-app alert (no native Alert / window.alert). */
export function userAlert(title: string, message?: string): void {
  useDialogStore.getState().showAlert({ title, message: message ?? '' });
}
