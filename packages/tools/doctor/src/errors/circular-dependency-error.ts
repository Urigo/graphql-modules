export class CircularDependencyError extends Error {
  constructor(public message: string, public cyclePath: { name: string; filePath: string }[]) {
    super(message);

    Object.setPrototypeOf(this, CircularDependencyError.prototype);
    Error.captureStackTrace(this, CircularDependencyError);
  }
}
