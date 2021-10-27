type EndCallback = () => void;

export interface Tracer {
  onContext(info: { id: string }): EndCallback;
  onDestroy(): EndCallback;
  onInjector(info: { name: string }): EndCallback;
}

export interface Tracing {
  session(context: GraphQLModules.GlobalContext): string;
  create(info: { session: string }): Tracer;
}

function noop() {}

export const emptyTracing: Tracing = {
  session() {
    return '';
  },
  create() {
    return {
      onContext() {
        return noop;
      },
      onDestroy() {
        return noop;
      },
      onInjector() {
        return noop;
      },
    };
  },
};
