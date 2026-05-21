const TIME_RE = /^(\d{1,2}):(\d{1,2})$/;

/** Returns true if value is a valid 24h time (e.g. 09:00, 9:00). */
export const parseTime24 = (value: string): boolean => normalizeTime24(value) !== null;

/** Normalizes to HH:MM or null if invalid. */
export const normalizeTime24 = (value: string): string | null => {
  const trimmed = value.trim();
  const match = trimmed.match(TIME_RE);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

export type ScheduleTimeFields = {
  workOn: string;
  workOff: string;
  examOn: string;
  examOff: string;
  nightOn: string;
  nightOff: string;
  bedtime: string;
};

export const normalizeScheduleTimes = (
  fields: ScheduleTimeFields,
): ScheduleTimeFields | null => {
  const keys = Object.keys(fields) as (keyof ScheduleTimeFields)[];
  const normalized = {} as ScheduleTimeFields;
  for (const key of keys) {
    const value = normalizeTime24(fields[key]);
    if (!value) return null;
    normalized[key] = value;
  }
  return normalized;
};
