export const asArray = <T>(fns: T | T[]) => (Array.isArray(fns) ? fns : [fns]);
export function normalizeSession<Session>(session: any): Session {
  // tslint:disable-next-line:no-console
  if ('session' in session) {
    session = session['session'];
  }

  if ('connection' in session && 'context' in session['connection']) {
    session = session['connection']['context']['session'];
  }

  return session;
}
