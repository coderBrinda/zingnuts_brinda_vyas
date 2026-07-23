export const MEMBER_MAX_HOURS = 10;
export const DEFAULT_MAX_HOURS = 24;

export function validateTimeEntryForm({
  entryDate,
  hours,
  maxHours = MEMBER_MAX_HOURS,
  existingEntries = [],
  excludeEntryId = null,
}) {
  const errors = {};

  if (!entryDate) {
    errors.entryDate = "Date is required";
  } else if (
    existingEntries.some(
      (entry) =>
        entry.entryDate === entryDate && entry.id !== excludeEntryId
    )
  ) {
    errors.entryDate =
      "You already logged time for this date on this project";
  }

  const hoursNum = Number(hours);
  if (!hours || Number.isNaN(hoursNum) || hoursNum <= 0) {
    errors.hours = "Hours must be greater than 0";
  } else if (hoursNum > maxHours) {
    errors.hours = `Hours must be at most ${maxHours}`;
  }

  return errors;
}

export function getApiFieldErrors(err) {
  const details = err.response?.data?.error?.details;
  if (Array.isArray(details)) return details;

  const errors = err.response?.data?.errors;
  if (Array.isArray(errors)) return errors;

  return [];
}
