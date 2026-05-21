import { create } from 'zustand';

export type DialogKind = 'alert' | 'confirm' | 'typedConfirm';

export type DialogPayload = {
  kind: DialogKind;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  confirmPhrase?: string;
  phraseHint?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
};

type DialogState = {
  visible: boolean;
  kind: DialogKind;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive: boolean;
  confirmPhrase?: string;
  phraseHint?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  showAlert: (opts: {
    title: string;
    message?: string;
    confirmLabel?: string;
  }) => void;
  showConfirm: (opts: {
    title: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
  }) => void;
  showTypedConfirm: (opts: {
    title: string;
    message?: string;
    confirmPhrase: string;
    phraseHint?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
  }) => void;
  dismiss: () => void;
};

const initialState = {
  visible: false,
  kind: 'alert' as DialogKind,
  title: '',
  message: undefined as string | undefined,
  confirmLabel: 'OK',
  cancelLabel: 'Cancel',
  destructive: false,
  confirmPhrase: undefined as string | undefined,
  phraseHint: undefined as string | undefined,
  onConfirm: undefined as (() => void | Promise<void>) | undefined,
  onCancel: undefined as (() => void) | undefined,
};

export const useDialogStore = create<DialogState>((set) => ({
  ...initialState,
  showAlert: ({ title, message, confirmLabel = 'OK' }) =>
    set({
      visible: true,
      kind: 'alert',
      title,
      message,
      confirmLabel,
      cancelLabel: 'Cancel',
      destructive: false,
      confirmPhrase: undefined,
      phraseHint: undefined,
      onConfirm: undefined,
      onCancel: undefined,
    }),
  showConfirm: ({
    title,
    message,
    confirmLabel = 'OK',
    cancelLabel = 'Cancel',
    destructive = false,
    onConfirm,
    onCancel,
  }) =>
    set({
      visible: true,
      kind: 'confirm',
      title,
      message,
      confirmLabel,
      cancelLabel,
      destructive,
      confirmPhrase: undefined,
      phraseHint: undefined,
      onConfirm,
      onCancel,
    }),
  showTypedConfirm: ({
    title,
    message,
    confirmPhrase,
    phraseHint,
    confirmLabel = 'Delete account',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
  }) =>
    set({
      visible: true,
      kind: 'typedConfirm',
      title,
      message,
      confirmLabel,
      cancelLabel,
      destructive: true,
      confirmPhrase,
      phraseHint: phraseHint ?? confirmPhrase,
      onConfirm,
      onCancel,
    }),
  dismiss: () => set({ ...initialState }),
}));
