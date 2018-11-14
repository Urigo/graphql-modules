import { Injector } from './injector';
import { ServiceIdentifier } from './types';
import { NAME_SESSION_INJECTOR_MAP } from './utils';

type ExtendedSession<Session> = Session & { [NAME_SESSION_INJECTOR_MAP]: Map<string, SessionInjector<Session>> };

export class SessionInjector<Session> {
  sessionScopeInstanceMap = new Map<ServiceIdentifier<any>, any>();
  constructor(
    public applicationInjector: Injector,
    private session: Session,
   ) {
    const extendedSession = session as ExtendedSession<Session>;
    extendedSession[NAME_SESSION_INJECTOR_MAP] = extendedSession[NAME_SESSION_INJECTOR_MAP] || new Map();
    extendedSession[NAME_SESSION_INJECTOR_MAP].set(this.applicationInjector.name, this);
   }
  public get<T>(serviceIdentifier: ServiceIdentifier<T>): T {
    return this.applicationInjector.get(serviceIdentifier, this.session);
  }
}
