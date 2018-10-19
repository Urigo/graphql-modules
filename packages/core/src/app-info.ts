import { AppContext } from '@graphql-modules/core/src/di/types';
import { GraphQLModule } from './graphql-module';

/** Current application info, includes information such as the current network request, the current execution context and the GraphQLApp */
export class AppInfo<Config, Request, Context> {
  private request: any;
  private context: AppContext<Context>;
  private appModule: GraphQLModule<Config, Request, Context>;

  /**
   * The method is used internally be `GraphQLApp` to set the request, context and app each
   * a context object has built.
   * @hidden
   */
  initialize({ request, context, appModule }: { request: Request; context: AppContext<Context>, appModule: GraphQLModule<Config, Request, Context> }) {
    this.request = request;
    this.context = context;
    this.appModule = appModule;
  }

  /** Returns the current network request. The request object comes from your network
   * library (such as `connect` or `express`).
   * @return network request object
   */
  public getRequest(): any {
    return this.request;
  }

  /** Returns the current GraphQL execution `context`.
   */
  public getContext(): AppContext<Context> {
    return this.context;
  }

  /** Returns the current `GraphQLApp` your are running it.
   */
  public getAppModule(): GraphQLModule<Config, Request, Context> {
    return this.appModule;
  }
}
