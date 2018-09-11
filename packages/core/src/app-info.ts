import { IGraphQLContext } from './graphql-module';
import { GraphQLApp } from './graphql-app';

/** Current application info, includes information such as the current network request, the current execution context and the GraphQLApp */
export class AppInfo {
  private request: any;
  private context: IGraphQLContext;
  private app: GraphQLApp;

  initialize({ request, context, app }: { request: any; context: IGraphQLContext, app: GraphQLApp }) {
    this.request = request;
    this.context = context;
    this.app = app;
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
  public getContext(): IGraphQLContext {
    return this.context;
  }

  /** Returns the current `GraphQLApp` your are running it.
   */
  public getApp(): GraphQLApp {
    return this.app;
  }
}
