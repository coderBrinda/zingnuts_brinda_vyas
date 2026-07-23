const MAX_HOURS_PER_ENTRY = 24;
const MAX_NOTE_LENGTH = 1000;

function isValidDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateCreateTimeEntry(body) {
  const errors = [];
  const entryDate = typeof body.entryDate === 'string' ? body.entryDate.trim() : '';
  const hours = Number(body.hours);
  const note = body.note === undefined || body.note === null
    ? null
    : typeof body.note === 'string'
      ? body.note.trim()
      : '';

  if (!entryDate) {
    errors.push({ field: 'entryDate', message: 'Entry date is required' });
  } else if (!isValidDateString(entryDate)) {
    errors.push({ field: 'entryDate', message: 'Entry date must be a valid date (YYYY-MM-DD)' });
  }

  if (body.hours === undefined || body.hours === null || body.hours === '') {
    errors.push({ field: 'hours', message: 'Hours is required' });
  } else if (Number.isNaN(hours) || hours <= 0) {
    errors.push({ field: 'hours', message: 'Hours must be a number greater than 0' });
  } else if (hours > MAX_HOURS_PER_ENTRY) {
    errors.push({ field: 'hours', message: `Hours must be at most ${MAX_HOURS_PER_ENTRY}` });
  }

  if (body.note !== undefined && body.note !== null && typeof body.note !== 'string') {
    errors.push({ field: 'note', message: 'Note must be a string' });
  } else if (note && note.length > MAX_NOTE_LENGTH) {
    errors.push({ field: 'note', message: `Note must be at most ${MAX_NOTE_LENGTH} characters` });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      entryDate,
      hours,
      note: note || null,
    },
  };
}

export function validateUpdateTimeEntry(body) {
  const errors = [];
  const hasEntryDate = Object.prototype.hasOwnProperty.call(body, 'entryDate');
  const hasHours = Object.prototype.hasOwnProperty.call(body, 'hours');
  const hasNote = Object.prototype.hasOwnProperty.call(body, 'note');

  if (!hasEntryDate && !hasHours && !hasNote) {
    errors.push({ field: 'body', message: 'At least one field is required to update' });
  }

  const entryDate = hasEntryDate && typeof body.entryDate === 'string'
    ? body.entryDate.trim()
    : undefined;
  const hours = hasHours ? Number(body.hours) : undefined;
  const note = hasNote
    ? body.note === null
      ? null
      : typeof body.note === 'string'
        ? body.note.trim()
        : undefined
    : undefined;

  if (hasEntryDate && !entryDate) {
    errors.push({ field: 'entryDate', message: 'Entry date cannot be empty' });
  } else if (entryDate && !isValidDateString(entryDate)) {
    errors.push({ field: 'entryDate', message: 'Entry date must be a valid date (YYYY-MM-DD)' });
  }

  if (hasHours && (Number.isNaN(hours) || hours <= 0)) {
    errors.push({ field: 'hours', message: 'Hours must be a number greater than 0' });
  } else if (hours !== undefined && hours > MAX_HOURS_PER_ENTRY) {
    errors.push({ field: 'hours', message: `Hours must be at most ${MAX_HOURS_PER_ENTRY}` });
  }

  if (hasNote && note !== null && note !== undefined && typeof note !== 'string') {
    errors.push({ field: 'note', message: 'Note must be a string or null' });
  } else if (typeof note === 'string' && note.length > MAX_NOTE_LENGTH) {
    errors.push({ field: 'note', message: `Note must be at most ${MAX_NOTE_LENGTH} characters` });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      entryDate,
      hours,
      note: note === undefined ? undefined : note || null,
    },
  };
}

export function validateEntryId(params) {
  const errors = [];
  const entryId = Number(params.entryId);

  if (!params.entryId || Number.isNaN(entryId) || entryId <= 0) {
    errors.push({ field: 'entryId', message: 'A valid time entry id is required' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: { entryId },
  };
}
