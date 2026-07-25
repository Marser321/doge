import type { OrderStatus, RequestStatus } from './types';

const requestTransitions: Record<RequestStatus, RequestStatus[]> = {
  new: ['reviewing', 'cancelled'],
  reviewing: ['quoted', 'cancelled'],
  quoted: ['approved', 'cancelled'],
  approved: ['scheduled', 'cancelled'],
  scheduled: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

const orderTransitions: Record<OrderStatus, OrderStatus[]> = {
  draft: ['confirmed', 'cancelled'],
  confirmed: ['fulfilled', 'cancelled'],
  fulfilled: ['refunded'],
  cancelled: [],
  refunded: [],
};

export function canTransitionRequest(from: RequestStatus, to: RequestStatus) {
  return requestTransitions[from].includes(to);
}

export function canCrewTransitionRequest(from: RequestStatus, to: RequestStatus) {
  return (from === 'scheduled' && to === 'in_progress') || (from === 'in_progress' && to === 'completed');
}

export function canTransitionOrder(from: OrderStatus, to: OrderStatus) {
  return orderTransitions[from].includes(to);
}

export function dollarsToCents(value: number) {
  if (!Number.isFinite(value) || value < 0) throw new Error('Invalid monetary value');
  return Math.round((value + Number.EPSILON) * 100);
}

export function subscriptionOccurrences(first: string, cadenceDays: number, horizon: string) {
  if (!Number.isInteger(cadenceDays) || cadenceDays < 1 || cadenceDays > 366) throw new Error('Invalid cadence');
  const cursor = new Date(`${first}T12:00:00Z`);
  const end = new Date(`${horizon}T12:00:00Z`);
  if (Number.isNaN(cursor.getTime()) || Number.isNaN(end.getTime())) throw new Error('Invalid date');
  const dates: string[] = [];
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + cadenceDays);
  }
  return dates;
}

export function safeInternalPath(value: string | null | undefined, fallback: string) {
  if (!value?.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  return value;
}

export function newYorkLocalToIso(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error('Invalid New York local date');
  const [, year, month, day, hour, minute] = match;
  const desired = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  let guess = desired;
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  for (let iteration = 0; iteration < 3; iteration += 1) {
    const parts = formatter.formatToParts(new Date(guess));
    const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((item) => item.type === type)?.value);
    const shown = Date.UTC(part('year'), part('month') - 1, part('day'), part('hour'), part('minute'));
    guess += desired - shown;
  }
  return new Date(guess).toISOString();
}

export function newYorkDate(value: Date | string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(typeof value === 'string' ? new Date(value) : value);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value || '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}
