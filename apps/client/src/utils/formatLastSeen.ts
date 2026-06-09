import i18n from '../i18next';

export const formatLastSeen = (date: string | Date): string => {
  const t = i18n.t.bind(i18n);
  const lng = i18n.language;
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  const time = d.toLocaleTimeString(lng, { hour: '2-digit', minute: '2-digit' });
  const dateStr = d.toLocaleDateString(lng, { day: 'numeric', month: 'long' });

  if (diffMin < 1) return t('userStatus.lastSeen.justNow');
  if (diffMin < 60) return t('userStatus.lastSeen.minutesAgo', { count: diffMin });
  if (diffHours < 3) return t('userStatus.lastSeen.hoursAgo', { count: diffHours });

  const isToday = now.toDateString() === d.toDateString();
  if (isToday) return t('userStatus.lastSeen.today', { time });

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (yesterday.toDateString() === d.toDateString()) {
    return t('userStatus.lastSeen.yesterday', { time });
  }

  if (diffDays < 7) return t('userStatus.lastSeen.daysAgo', { count: diffDays });
  if (diffWeeks < 4) return t('userStatus.lastSeen.weeksAgo', { count: diffWeeks, time });
  if (diffMonths < 12) return t('userStatus.lastSeen.monthsAgo', { count: diffMonths });
  if (diffMonths < 24) return t('userStatus.lastSeen.yearAgo');

  return t('userStatus.lastSeen.dateWithTime', { date: dateStr, time });
};
