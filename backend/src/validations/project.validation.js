const DEFAULT_MONTHLY_HOUR_CAP = 160;

export function validateCreateProject(body) {
  const errors = [];
  const projectName = typeof body.projectName === 'string' ? body.projectName.trim() : '';
  const clientName = typeof body.clientName === 'string' ? body.clientName.trim() : '';
  const monthlyHourCapRaw = body.monthlyHourCap ?? DEFAULT_MONTHLY_HOUR_CAP;
  const monthlyHourCap = Number(monthlyHourCapRaw);

  if (!projectName) {
    errors.push({ field: 'projectName', message: 'Project name is required' });
  } else if (projectName.length > 200) {
    errors.push({ field: 'projectName', message: 'Project name must be at most 200 characters' });
  }

  if (!clientName) {
    errors.push({ field: 'clientName', message: 'Client name is required' });
  } else if (clientName.length > 200) {
    errors.push({ field: 'clientName', message: 'Client name must be at most 200 characters' });
  }

  if (Number.isNaN(monthlyHourCap) || monthlyHourCap <= 0) {
    errors.push({ field: 'monthlyHourCap', message: 'Monthly hour cap must be a number greater than 0' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: { projectName, clientName, monthlyHourCap },
  };
}

export function validateUpdateProject(body) {
  const errors = [];
  const hasProjectName = Object.prototype.hasOwnProperty.call(body, 'projectName');
  const hasClientName = Object.prototype.hasOwnProperty.call(body, 'clientName');
  const hasMonthlyHourCap = Object.prototype.hasOwnProperty.call(body, 'monthlyHourCap');

  if (!hasProjectName && !hasClientName && !hasMonthlyHourCap) {
    errors.push({ field: 'body', message: 'At least one field is required to update' });
  }

  const projectName = hasProjectName && typeof body.projectName === 'string'
    ? body.projectName.trim()
    : undefined;
  const clientName = hasClientName && typeof body.clientName === 'string'
    ? body.clientName.trim()
    : undefined;
  const monthlyHourCap = hasMonthlyHourCap ? Number(body.monthlyHourCap) : undefined;

  if (hasProjectName && !projectName) {
    errors.push({ field: 'projectName', message: 'Project name cannot be empty' });
  } else if (projectName && projectName.length > 200) {
    errors.push({ field: 'projectName', message: 'Project name must be at most 200 characters' });
  }

  if (hasClientName && !clientName) {
    errors.push({ field: 'clientName', message: 'Client name cannot be empty' });
  } else if (clientName && clientName.length > 200) {
    errors.push({ field: 'clientName', message: 'Client name must be at most 200 characters' });
  }

  if (hasMonthlyHourCap && (Number.isNaN(monthlyHourCap) || monthlyHourCap <= 0)) {
    errors.push({ field: 'monthlyHourCap', message: 'Monthly hour cap must be a number greater than 0' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: { projectName, clientName, monthlyHourCap },
  };
}

export function validateAssignManager(body) {
  const errors = [];
  const userId = Number(body.userId);

  if (!body.userId || Number.isNaN(userId) || userId <= 0) {
    errors.push({ field: 'userId', message: 'A valid PM user id is required' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: { userId },
  };
}
