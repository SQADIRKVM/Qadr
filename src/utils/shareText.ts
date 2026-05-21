import { Platform, Share } from 'react-native';
import { userAlert } from './userAlert';

export async function shareText(title: string, message: string): Promise<boolean> {
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(message);
      userAlert(title, 'Copied to clipboard.');
      return true;
    }
    const result = await Share.share(
      Platform.OS === 'ios' ? { message, title } : { message, title },
    );
    return result.action !== Share.dismissedAction;
  } catch {
    userAlert(title, 'Could not share. Try again.');
    return false;
  }
}

export function buildSmsUrl(phone: string | undefined, body: string): string {
  const encoded = encodeURIComponent(body);
  if (phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits) {
      return Platform.OS === 'ios'
        ? `sms:${digits}&body=${encoded}`
        : `sms:${digits}?body=${encoded}`;
    }
  }
  return Platform.OS === 'ios' ? `sms:&body=${encoded}` : `sms:?body=${encoded}`;
}
