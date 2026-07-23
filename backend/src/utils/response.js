export function sendSuccess(res, statusCode, data, message = null) {
  const body = { success: true, data };
  if (message) {
    body.message = message;
  }
  return res.status(statusCode).json(body);
}

export function sendError(res, statusCode, message, code, details = []) {
  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      details,
    },
  });
}
