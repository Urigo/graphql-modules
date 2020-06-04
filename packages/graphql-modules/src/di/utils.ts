export const ERROR_TYPE = 'diType';
export const ERROR_ORIGINAL_ERROR = 'diOriginalError';
export const ERROR_LOGGER = 'diErrorLogger';

export function getType(error: Error): Function {
  return (error as any)[ERROR_TYPE];
}

export function getOriginalError(error: Error): Error {
  return (error as any)[ERROR_ORIGINAL_ERROR];
}

function defaultErrorLogger(console: Console, ...values: any[]) {
  (<any>console.error)(...values);
}

export function getErrorLogger(
  error: Error
): (console: Console, ...values: any[]) => void {
  return (error as any)[ERROR_LOGGER] || defaultErrorLogger;
}

export function wrappedError(message: string, originalError: any): Error {
  const msg = `${message} caused by: ${
    originalError instanceof Error ? originalError.message : originalError
  }`;
  const error = Error(msg);
  (error as any)[ERROR_ORIGINAL_ERROR] = originalError;
  return error;
}

export function stringify(token: any): string {
  if (typeof token === 'string') {
    return token;
  }

  if (token == null) {
    return '' + token;
  }

  if (token.name) {
    return `${token.name}`;
  }

  const res = token.toString();
  const newLineIndex = res.indexOf('\n');

  return newLineIndex === -1 ? res : res.substring(0, newLineIndex);
}
