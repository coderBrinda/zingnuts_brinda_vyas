const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_SIGN_UP_ROLES = ['member'];

export function validateSignIn(body) {
  const errors = [];
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: { email, password },
  };
}

export function validateSignUp(body) {
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
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }

  if (!ALLOWED_SIGN_UP_ROLES.includes(role)) {
    errors.push({ field: 'role', message: 'Invalid role for registration' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: { name, email, password, role },
  };
}
