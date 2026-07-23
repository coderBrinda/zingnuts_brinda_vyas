export function validateAssignMember(body) {
  const errors = [];
  const memberId = Number(body.memberId);

  if (!body.memberId || Number.isNaN(memberId) || memberId <= 0) {
    errors.push({ field: 'memberId', message: 'A valid member id is required' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: { memberId },
  };
}

export function validateRemoveMember(params) {
  const errors = [];
  const memberId = Number(params.memberId);

  if (!params.memberId || Number.isNaN(memberId) || memberId <= 0) {
    errors.push({ field: 'memberId', message: 'A valid member id is required' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: { memberId },
  };
}
