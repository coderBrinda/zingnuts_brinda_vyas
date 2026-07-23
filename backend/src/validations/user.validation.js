const VALID_ROLES = ['admin', 'pm', 'member'];

export function validateCreateUser(body) {
  const errors = [];
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const role = typeof body.role === 'string' ? body.role.trim().toLowerCase() : 'member';

  if (!name) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (name.length > 100) {
    errors.push({ field: 'name', message: 'Name must be at most 100 characters' });
  }

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'Email must be valid' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  if (!VALID_ROLES.includes(role)) {
    errors.push({ field: 'role', message: 'Role must be admin, pm, or member' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: { name, email, password, role },
  };
}

export function validateUpdateUser(body) {
  const errors = [];
  const hasName = Object.prototype.hasOwnProperty.call(body, 'name');
  const hasRole = Object.prototype.hasOwnProperty.call(body, 'role');
  const hasIsActive = Object.prototype.hasOwnProperty.call(body, 'isActive');

  if (!hasName && !hasRole && !hasIsActive) {
    errors.push({ field: 'body', message: 'At least one field is required to update' });
  }

  const name = hasName && typeof body.name === 'string' ? body.name.trim() : undefined;
  const role = hasRole && typeof body.role === 'string' ? body.role.trim().toLowerCase() : undefined;
  const isActive = hasIsActive ? Boolean(body.isActive) : undefined;

  if (hasName && !name) {
    errors.push({ field: 'name', message: 'Name cannot be empty' });
  } else if (name && name.length > 100) {
    errors.push({ field: 'name', message: 'Name must be at most 100 characters' });
  }

  if (hasRole && !VALID_ROLES.includes(role)) {
    errors.push({ field: 'role', message: 'Role must be admin, pm, or member' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: { name, role, isActive },
  };
}

export function validateUserId(params) {
  const errors = [];
  const userId = Number(params.userId);

  if (!params.userId || Number.isNaN(userId) || userId <= 0) {
    errors.push({ field: 'userId', message: 'A valid user id is required' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: { userId },
  };
}
