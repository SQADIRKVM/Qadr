import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabase } from '../../lib/supabase';
import { useSettingsStore } from '../../stores/useSettingsStore';

const CURRENT_SESSION_KEY = 'qadr-current-session-id';

export interface UserSessionRow {
  id: string;
  user_id: string;
  device_label: string | null;
  platform: string | null;
  ip_address: string | null;
  user_agent: string | null;
  last_active_at: string;
  created_at: string;
}

function getDeviceLabel(): string {
  const custom = useSettingsStore.getState().deviceName?.trim();
  if (custom) return custom;
  if (Platform.OS === 'web') return 'Web browser';
  if (Platform.OS === 'ios') return 'iPhone / iPad';
  if (Platform.OS === 'android') return 'Android device';
  return Platform.OS;
}

function getUserAgent(): string | null {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    return navigator.userAgent.slice(0, 500);
  }
  return null;
}

async function fetchClientIp(): Promise<string | null> {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (!res.ok) return null;
    const data = (await res.json()) as { ip?: string };
    return data.ip ?? null;
  } catch {
    return null;
  }
}

export async function getCurrentSessionId(): Promise<string | null> {
  return AsyncStorage.getItem(CURRENT_SESSION_KEY);
}

export async function setCurrentSessionId(id: string): Promise<void> {
  await AsyncStorage.setItem(CURRENT_SESSION_KEY, id);
}

export async function clearCurrentSessionId(): Promise<void> {
  await AsyncStorage.removeItem(CURRENT_SESSION_KEY);
}

/** Register or refresh this device's session row after sign-in / app open. */
export async function upsertCurrentSession(userId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const existingId = await getCurrentSessionId();
  const now = new Date().toISOString();
  const ip = await fetchClientIp();

  const payload = {
    user_id: userId,
    device_label: getDeviceLabel(),
    platform: Platform.OS,
    ip_address: ip,
    user_agent: getUserAgent(),
    last_active_at: now,
  };

  if (existingId) {
    const { error } = await supabase
      .from('user_sessions')
      .update(payload)
      .eq('id', existingId)
      .eq('user_id', userId);
    if (!error) return;
    await clearCurrentSessionId();
  }

  const { data, error } = await supabase
    .from('user_sessions')
    .insert(payload)
    .select('id')
    .single();

  if (!error && data?.id) {
    await setCurrentSessionId(data.id);
  }
}

export async function listUserSessions(userId: string): Promise<UserSessionRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('last_active_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as UserSessionRow[];
}

export async function revokeSession(userId: string, sessionId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const currentId = await getCurrentSessionId();
  const { error } = await supabase
    .from('user_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', userId);

  if (error) throw error;
  if (currentId === sessionId) {
    await clearCurrentSessionId();
  }
}

export async function deleteAllSessionsForUser(userId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  await supabase.from('user_sessions').delete().eq('user_id', userId);
  await clearCurrentSessionId();
}
