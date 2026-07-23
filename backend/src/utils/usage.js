const CAP_STATUS_LABELS = {
  ok: 'Within monthly cap',
  warning: 'Within 10% of monthly cap',
  over_cap: 'Over monthly cap',
};

export function getCurrentMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function buildUsage(monthlyHourCap, currentMonthHours = 0) {
  const cap = Number(monthlyHourCap);
  const hours = Number(currentMonthHours);
  const usagePercent = cap > 0 ? Number(((hours / cap) * 100).toFixed(1)) : 0;
  const remainingHours = Number((cap - hours).toFixed(2));

  let capStatus = 'ok';

  if (usagePercent > 100) {
    capStatus = 'over_cap';
  } else if (usagePercent >= 90) {
    capStatus = 'warning';
  }

  return {
    month: getCurrentMonthKey(),
    currentMonthHours: hours,
    remainingHours,
    usagePercent,
    capStatus,
    capStatusLabel: CAP_STATUS_LABELS[capStatus],
  };
}
